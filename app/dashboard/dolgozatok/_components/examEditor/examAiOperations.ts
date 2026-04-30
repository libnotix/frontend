import type { Dispatch, SetStateAction } from "react";
import type { ExamQuestionEdit } from "@/api";
import { dedupeCanvasItemsById, newCanvasItemId } from "../dnd/canvasItemsState";
import type { CanvasItem } from "../types";
import { usePendingExamEditsStore } from "../aiEdit/pendingExamEditsStore";
import { coerceExamTaskTypeId, yamlStringToLoadedQuestion, yamlToFormDefaults } from "../aiEdit/yamlClient";

type AcceptCtx = {
  examId: number;
  applyQuestionDefaults: (canvasItemId: string, formDefaults: Record<string, unknown>) => void;
  setLeftItems: Dispatch<SetStateAction<CanvasItem[]>>;
  debouncedSave: () => void;
};

function reorderExamCanvas(
  items: CanvasItem[],
  clientId: string,
  afterClientId: string | null,
): CanvasItem[] {
  const clean = dedupeCanvasItemsById(items);
  const from = clean.findIndex((i) => i.id === clientId);
  if (from < 0) return items;
  const next = [...clean];
  const [moved] = next.splice(from, 1);
  if (afterClientId == null || afterClientId === "") {
    next.unshift(moved);
    return next;
  }
  const anchor = next.findIndex((i) => i.id === afterClientId);
  if (anchor < 0) {
    next.push(moved);
    return next;
  }
  next.splice(anchor + 1, 0, moved);
  return dedupeCanvasItemsById(next);
}

export function applyExamAiOperation(op: ExamQuestionEdit, ctx: AcceptCtx) {
  const st = usePendingExamEditsStore.getState();
  const typeArg = typeof op.type === "string" ? op.type : String(op.type ?? "");

  if (op.op === "update") {
    const tid = coerceExamTaskTypeId(typeArg);
    if (!tid || !op.clientId || !op.yaml?.trim()) return;
    const parsed = yamlToFormDefaults(tid, op.yaml);
    if (!parsed.ok) return;
    ctx.applyQuestionDefaults(op.clientId, parsed.values);
    st.removePendingOperation(ctx.examId, op.operationId);
    ctx.debouncedSave();
    return;
  }

  if (op.op === "create") {
    const tid = coerceExamTaskTypeId(typeArg);
    if (!tid) return;
    const loaded = yamlStringToLoadedQuestion(tid, op.yaml);
    ctx.setLeftItems((prev) => {
      const clean = dedupeCanvasItemsById(prev);
      const newItem: CanvasItem = {
        id: newCanvasItemId(tid),
        typeId: tid,
        loadedQuestion: loaded ?? undefined,
      };
      const after = op.afterClientId;
      if (!after) return [newItem, ...clean];
      const ix = clean.findIndex((i) => i.id === after);
      if (ix < 0) return [...clean, newItem];
      const nx = [...clean];
      nx.splice(ix + 1, 0, newItem);
      return nx;
    });
    st.removePendingOperation(ctx.examId, op.operationId);
    ctx.debouncedSave();
    return;
  }

  if (op.op === "delete") {
    if (!op.clientId) return;
    ctx.setLeftItems((prev) => dedupeCanvasItemsById(prev.filter((i) => i.id !== op.clientId)));
    st.removePendingOperation(ctx.examId, op.operationId);
    ctx.debouncedSave();
    return;
  }

  if (op.op === "reorder") {
    if (!op.clientId) return;
    ctx.setLeftItems((prev) => reorderExamCanvas(prev, op.clientId!, op.afterClientId ?? null));
    st.removePendingOperation(ctx.examId, op.operationId);
    ctx.debouncedSave();
  }
}
