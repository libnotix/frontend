"use client";

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";
import type { ExamQuestionInput } from "@/api";

/** Fields collected from each question card form for the PUT /exams/{id}/questions body. */
export type ExamQuestionFormSnapshot = Pick<
   ExamQuestionInput,
   "title" | "description" | "spec" | "correctAnswer" | "rubric" | "maxPoints"
>;

type Getter = () => ExamQuestionFormSnapshot | null;

type ExamSaveContextValue = {
   registerQuestionSnapshot: (canvasItemId: string, getter: Getter) => void;
   unregisterQuestionSnapshot: (canvasItemId: string) => void;
   getQuestionSnapshot: (canvasItemId: string) => ExamQuestionFormSnapshot | null;
};

const ExamSaveContext = createContext<ExamSaveContextValue | null>(null);

export function ExamSaveProvider({ children }: { children: ReactNode }) {
   const gettersRef = useRef(new Map<string, Getter>());

   const registerQuestionSnapshot = useCallback((canvasItemId: string, getter: Getter) => {
      gettersRef.current.set(canvasItemId, getter);
   }, []);

   const unregisterQuestionSnapshot = useCallback((canvasItemId: string) => {
      gettersRef.current.delete(canvasItemId);
   }, []);

   const getQuestionSnapshot = useCallback((canvasItemId: string) => {
      const getter = gettersRef.current.get(canvasItemId);
      return getter?.() ?? null;
   }, []);

   const value = useMemo(
      () => ({ registerQuestionSnapshot, unregisterQuestionSnapshot, getQuestionSnapshot }),
      [registerQuestionSnapshot, unregisterQuestionSnapshot, getQuestionSnapshot],
   );

   return <ExamSaveContext.Provider value={value}>{children}</ExamSaveContext.Provider>;
}

export function useExamSave() {
   const ctx = useContext(ExamSaveContext);
   if (!ctx) {
      throw new Error("useExamSave must be used within ExamSaveProvider");
   }
   return ctx;
}
