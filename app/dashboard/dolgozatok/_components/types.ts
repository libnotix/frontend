import type { ExamTaskTypeId } from "./examTaskTypes";

export type CanvasItem = {
   id: string;
   typeId: ExamTaskTypeId;
   questionId?: number;
   /** Eredeti kérdés a GET /exams/{id} válaszból — űrlap kitöltéshez */
   loadedQuestion?: unknown;
};
