import type { ExamTaskTypeId } from "./examTaskTypes";

export type CanvasItem = {
   id: string;
   typeId: ExamTaskTypeId;
   questionId?: number;
   /** Eredeti kérdés a GET /exams/{id} válaszból — űrlap kitöltéshez */
   loadedQuestion?: unknown;
   /** Pending AI create-op: links ghost card UI to envelope operation id */
   ghostOperationId?: string;
};
