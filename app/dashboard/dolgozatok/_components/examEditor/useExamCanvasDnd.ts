import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import type { DragDropManager } from "@dnd-kit/dom";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/react";
import { isSortableOperation } from "@dnd-kit/react/sortable";
import type { ExamLeftViewMode } from "../../[id]/ExamDynamicIsland";
import { CANVAS_SORTABLE_GROUP } from "../constants";
import { dedupeCanvasItemsById, mergeCanvasOrder, newCanvasItemId } from "../dnd/canvasItemsState";
import { getOrderedCanvasItemIds } from "../dnd/getOrderedCanvasItemIds";
import { isExamTaskTypeId } from "../examTaskTypes";
import type { CanvasItem } from "../types";

type UseExamCanvasDndArgs = {
  leftViewMode: ExamLeftViewMode;
  setLeftViewMode: Dispatch<SetStateAction<ExamLeftViewMode>>;
  setLeftItems: Dispatch<SetStateAction<CanvasItem[]>>;
  debouncedSave: () => void;
};

export function useExamCanvasDnd({
  leftViewMode,
  setLeftViewMode,
  setLeftItems,
  debouncedSave,
}: UseExamCanvasDndArgs) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const sourceId = event.operation.source?.id != null ? String(event.operation.source.id) : "";
      if (sourceId.startsWith("palette-") && leftViewMode === "preview") {
        setLeftViewMode("editor");
      }
      setActiveDragId(sourceId || null);
    },
    [leftViewMode, setLeftViewMode],
  );

  const onDragOver = useCallback((event: DragOverEvent) => {
    setHoveredTargetId(event.operation.target?.id != null ? String(event.operation.target.id) : null);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent, manager: DragDropManager) => {
      setActiveDragId(null);
      setHoveredTargetId(null);

      if (event.canceled) return;

      const sourceId = event.operation.source?.id != null ? String(event.operation.source.id) : "";
      const targetId = event.operation.target?.id != null ? String(event.operation.target.id) : "";
      if (!sourceId || !targetId) return;

      const isTargetCanvasItem =
        targetId !== "droppable-1" && targetId !== "droppable-2" && !targetId.startsWith("palette-");
      const isTargetPaletteItem = targetId === "droppable-2" || targetId.startsWith("palette-");

      if (sourceId.startsWith("palette-") && (targetId === "droppable-1" || isTargetCanvasItem)) {
        const typeId = sourceId.replace("palette-", "");
        if (!isExamTaskTypeId(typeId)) return;
        const newItem: CanvasItem = { id: newCanvasItemId(typeId), typeId };

        setLeftItems((prev) => {
          const clean = dedupeCanvasItemsById(prev);
          if (isTargetCanvasItem) {
            const targetIndex = clean.findIndex((i) => i.id === targetId);
            if (targetIndex !== -1) {
              const newItems = [...clean];
              newItems.splice(targetIndex, 0, newItem);
              debouncedSave();
              return newItems;
            }
          }
          debouncedSave();
          return [...clean, newItem];
        });
        return;
      }

      if (!sourceId.startsWith("palette-") && isTargetPaletteItem) {
        setLeftItems((prev) => dedupeCanvasItemsById(prev.filter((item) => item.id !== sourceId)));
        debouncedSave();
        return;
      }

      if (isSortableOperation(event.operation)) {
        setLeftItems((prev) => {
          const orderedIds = getOrderedCanvasItemIds(manager, CANVAS_SORTABLE_GROUP);
          const next = mergeCanvasOrder(prev, orderedIds);
          debouncedSave();
          return next;
        });
        return;
      }

      if (!sourceId.startsWith("palette-") && targetId === "droppable-1") {
        setLeftItems((prev) => {
          const clean = dedupeCanvasItemsById(prev);
          const oldIndex = clean.findIndex((i) => i.id === sourceId);
          if (oldIndex < 0) return clean;
          const newItems = [...clean];
          const [moved] = newItems.splice(oldIndex, 1);
          newItems.push(moved);
          debouncedSave();
          return newItems;
        });
      }
    },
    [debouncedSave, setLeftItems],
  );

  return {
    activeDragId,
    hoveredTargetId,
    onDragStart,
    onDragOver,
    onDragEnd,
  };
}
