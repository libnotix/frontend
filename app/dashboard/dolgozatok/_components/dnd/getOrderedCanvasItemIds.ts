import type { DragDropManager } from "@dnd-kit/dom";
import { SortableDroppable } from "@dnd-kit/dom/sortable";

/**
 * Reads the current sort order from the drag-drop registry after a sortable operation.
 * Keeps React `leftItems` in sync with what @dnd-kit already applied in the DOM.
 */
export function getOrderedCanvasItemIds(manager: DragDropManager, group: string): string[] {
   const rows: { id: string; index: number }[] = [];

   for (const droppable of manager.registry.droppables) {
      if (!(droppable instanceof SortableDroppable)) continue;
      const { sortable } = droppable;
      const g = sortable.group != null ? String(sortable.group) : "__default__";
      if (g !== group) continue;
      rows.push({ id: String(sortable.id), index: sortable.index });
   }

   rows.sort((a, b) => a.index - b.index);
   return rows.map((r) => r.id);
}
