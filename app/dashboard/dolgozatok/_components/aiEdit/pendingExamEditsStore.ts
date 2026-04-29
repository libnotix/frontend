import { create } from "zustand";
import type { ExamAiEditResponse, ExamQuestionEdit } from "@/api";

export type PendingExamOpHandlers = {
   acceptOperation: (op: ExamQuestionEdit) => void;
   rejectOperation: (operationId: string) => void;
   acceptAll: () => void;
   rejectAll: () => void;
};

export type PendingStoreEntry = {
   changeSetId: string;
   baseRevision: string;
   messageId?: string;
   response: ExamAiEditResponse;
};

type StoreState = {
   byExam: Partial<Record<number, PendingStoreEntry>>;
   opHandlers: Partial<Record<number, PendingExamOpHandlers>>;
   registerExamOpHandlers: (examId: number, handlers: PendingExamOpHandlers | null) => void;
   applyEdits: (examId: number, input: { messageId?: string; response: ExamAiEditResponse }) => void;
   removePendingOperation: (examId: number, operationId: string) => void;
   clearChangeSet: (examId: number) => void;
   acceptEdit: (examId: number, operationId: string) => void;
   rejectEdit: (examId: number, operationId: string) => void;
   /** Match update/delete/reorder/create (via `ghostOperationId` = operationId) to the canvas card. */
   getPendingForCard: (
      examId: number | null | undefined,
      card: { canvasId: string; ghostOperationId?: string },
   ) => ExamQuestionEdit | undefined;
   getCreations: (examId: number | null | undefined) => ExamQuestionEdit[];
};

/** Stable empty reference — avoids useSyncExternalStore getServerSnapshot mismatch when no creations. */
const EMPTY_QUESTION_EDITS: ExamQuestionEdit[] = [];

function pendingQuestionEdits(entry: PendingStoreEntry | undefined): ExamQuestionEdit[] {
   if (!entry) return EMPTY_QUESTION_EDITS;
   if (entry.response.edits?.status !== "pending") return EMPTY_QUESTION_EDITS;
   return entry.response.edits.questionEdits ?? EMPTY_QUESTION_EDITS;
}

export const usePendingExamEditsStore = create<StoreState>((set, get) => ({
   byExam: {},
   opHandlers: {},

   registerExamOpHandlers(examId, handlers) {
      set((s) => {
         const next = { ...s.opHandlers };
         if (!handlers) delete next[examId];
         else next[examId] = handlers;
         return { opHandlers: next };
      });
   },

   applyEdits(examId, input) {
      set((s) => ({
         byExam: {
            ...s.byExam,
            [examId]: {
               changeSetId: input.response.changeSetId,
               baseRevision: input.response.baseRevision,
               messageId: input.messageId,
               response: input.response,
            },
         },
      }));
   },

   removePendingOperation(examId, operationId) {
      set((s) => {
         const ent = s.byExam[examId];
         if (!ent) return s;
         const nextQs = (ent.response.edits.questionEdits ?? []).filter((e) => e.operationId !== operationId);
         if (nextQs.length === 0 && !ent.response.edits.examMetaEdits) {
            const rest = { ...s.byExam };
            delete rest[examId];
            return { byExam: rest };
         }
         return {
            byExam: {
               ...s.byExam,
               [examId]: {
                  ...ent,
                  response: {
                     ...ent.response,
                     hasEdits: nextQs.length > 0 || !!ent.response.edits.examMetaEdits,
                     edits: {
                        ...ent.response.edits,
                        questionEdits: nextQs,
                     },
                  },
               },
            },
         };
      });
   },

   clearChangeSet(examId) {
      set((s) => {
         const next = { ...s.byExam };
         delete next[examId];
         return { byExam: next };
      });
   },

   acceptEdit(examId, operationId) {
      const handlers = get().opHandlers[examId];
      const entry = get().byExam[examId];
      const op = entry?.response.edits.questionEdits.find((e) => e.operationId === operationId);
      if (!op || !handlers) return;
      handlers.acceptOperation(op);
   },

   rejectEdit(examId, operationId) {
      const handlers = get().opHandlers[examId];
      handlers?.rejectOperation(operationId);
   },

   getPendingForCard(examId, card) {
      if (!examId) return undefined;
      const ops = pendingQuestionEdits(get().byExam[examId]);
      if (card.ghostOperationId) {
         return ops.find((e) => e.op === "create" && e.operationId === card.ghostOperationId);
      }
      return ops.find((e) => {
         if (e.op === "create") return false;
         return e.clientId === card.canvasId;
      });
   },

   getCreations(examId) {
      if (!examId) return EMPTY_QUESTION_EDITS;
      const creations = pendingQuestionEdits(get().byExam[examId]).filter((e) => e.op === "create");
      return creations.length === 0 ? EMPTY_QUESTION_EDITS : creations;
   },
}));
