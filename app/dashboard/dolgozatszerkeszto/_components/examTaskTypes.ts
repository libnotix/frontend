/**
 * Stable identifiers for task kinds on the dolgozat / exam editor canvas.
 * Use these in switches, Zod registries, and APIs — not opaque `item-n` slugs.
 */
export const EXAM_TASK_TYPE = {
   /** Több válaszlehetőség, egy vagy több helyes (jelenlegi UI: feleletválasztós) */
   MultipleChoice: "multiple_choice",
   /** Igaz / hamis */
   TrueFalse: "true_false",
   /** Rövid szöveges válasz */
   ShortAnswer: "short_answer",
   /** Párosítás (kifejezés ↔ válasz) */
   Matching: "matching",
   /** Hosszú / esszé jellegű válasz */
   LongAnswer: "long_answer",
} as const;

export type ExamTaskTypeId = (typeof EXAM_TASK_TYPE)[keyof typeof EXAM_TASK_TYPE];

export const EXAM_TASK_TYPE_IDS: ExamTaskTypeId[] = Object.values(EXAM_TASK_TYPE);

export function isExamTaskTypeId(value: string): value is ExamTaskTypeId {
   return EXAM_TASK_TYPE_IDS.includes(value as ExamTaskTypeId);
}
