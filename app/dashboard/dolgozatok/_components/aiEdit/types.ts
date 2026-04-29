import type {
   ExamAiEditResponse,
   ExamAiEditsEnvelope,
   ExamEditConflict,
   ExamMetaEdits,
   ExamQuestionEdit,
} from "@/api";

export type { ExamAiEditResponse, ExamAiEditsEnvelope, ExamEditConflict, ExamMetaEdits, ExamQuestionEdit };

/** Mirrors backend `ExamEditOp`. */
export type EditOpKind = ExamQuestionEdit["op"];

/** One pending suggestion with frontend-friendly status tracking. */
export type PendingExamEdit = ExamQuestionEdit & {
   status?: "pending" | "applied" | "rejected";
};

/** A change set applied to chat + canvas (typically one AI assistant turn). */
export type PendingExamEditGroup = {
   changeSetId: string;
   baseRevision: string;
   /** Persisted AI message id when known (PATCH status). */
   messageId?: string;
   checksum?: string;
   response: ExamAiEditResponse;
   /** Per-operation status; defaults to pending when missing. */
   opStatus: Record<string, "pending" | "applied" | "rejected">;
};

export function isPendingOpStatus(
   s: "pending" | "applied" | "rejected" | undefined,
): s is undefined | "pending" {
   return s === undefined || s === "pending";
}
