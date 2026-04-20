import type { ExamTaskTypeId } from "./examTaskTypes";
import { EXAM_TASK_TYPE } from "./examTaskTypes";

/** All canvas question cards must use this `group` in `useSortable` so reordering stays consistent. */
export const CANVAS_SORTABLE_GROUP = "dolgozat-canvas-questions";

export const AVAILABLE_TASK_TYPES: readonly { id: ExamTaskTypeId; text: string }[] = [
   { id: EXAM_TASK_TYPE.MultipleChoice, text: "Feleletválasztós" },
   { id: EXAM_TASK_TYPE.TrueFalse, text: "Igaz/Hamis" },
   { id: EXAM_TASK_TYPE.ShortAnswer, text: "Rövid válasz" },
   { id: EXAM_TASK_TYPE.Matching, text: "Párosítás" },
   { id: EXAM_TASK_TYPE.LongAnswer, text: "Hosszú válasz" },
];

export function taskTypeLabel(typeId: string): string | undefined {
   return AVAILABLE_TASK_TYPES.find((item) => item.id === typeId)?.text;
}
