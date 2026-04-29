"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { ExamQuestionInput } from "@/api";

/** Fields collected from each question card form for the PUT /exams/{id}/questions body. */
export type ExamQuestionFormSnapshot = Pick<
   ExamQuestionInput,
   "title" | "description" | "spec" | "correctAnswer" | "rubric" | "maxPoints"
>;

type Getter = () => ExamQuestionFormSnapshot | null;

/** Push AI-proposed defaults into an existing mounted question form (merge with `reset`). */
export type QuestionApplyDefaultsFn = (formDefaults: Record<string, unknown>) => void;

type ExamSaveContextValue = {
   registerQuestionSnapshot: (canvasItemId: string, getter: Getter) => void;
   unregisterQuestionSnapshot: (canvasItemId: string) => void;
   getQuestionSnapshot: (canvasItemId: string) => ExamQuestionFormSnapshot | null;
   registerQuestionApply: (canvasItemId: string, applyFn: QuestionApplyDefaultsFn | null) => void;
   unregisterQuestionApply: (canvasItemId: string) => void;
   applyQuestionDefaults: (canvasItemId: string, formDefaults: Record<string, unknown>) => void;
   registerQuestionValidity: (canvasItemId: string, isValid: boolean) => void;
   unregisterQuestionValidity: (canvasItemId: string) => void;
   invalidQuestionIds: string[];
};

const ExamSaveContext = createContext<ExamSaveContextValue | null>(null);

export function ExamSaveProvider({ children }: { children: ReactNode }) {
   const gettersRef = useRef(new Map<string, Getter>());
   const applyRef = useRef(new Map<string, QuestionApplyDefaultsFn>());
   const [validityById, setValidityById] = useState<Record<string, boolean>>({});

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

   const registerQuestionApply = useCallback((canvasItemId: string, applyFn: QuestionApplyDefaultsFn | null) => {
      if (applyFn === null) applyRef.current.delete(canvasItemId);
      else applyRef.current.set(canvasItemId, applyFn);
   }, []);

   const unregisterQuestionApply = useCallback((canvasItemId: string) => {
      applyRef.current.delete(canvasItemId);
   }, []);

   const applyQuestionDefaults = useCallback((canvasItemId: string, formDefaults: Record<string, unknown>) => {
      applyRef.current.get(canvasItemId)?.(formDefaults);
   }, []);

   const registerQuestionValidity = useCallback((canvasItemId: string, isValid: boolean) => {
      setValidityById((current) => {
         if (current[canvasItemId] === isValid) return current;
         return { ...current, [canvasItemId]: isValid };
      });
   }, []);

   const unregisterQuestionValidity = useCallback((canvasItemId: string) => {
      setValidityById((current) => {
         if (!(canvasItemId in current)) return current;
         const next = { ...current };
         delete next[canvasItemId];
         return next;
      });
   }, []);

   const invalidQuestionIds = useMemo(
      () => Object.entries(validityById).filter(([, isValid]) => !isValid).map(([id]) => id),
      [validityById],
   );

   const value = useMemo(
      () => ({
         registerQuestionSnapshot,
         unregisterQuestionSnapshot,
         getQuestionSnapshot,
         registerQuestionApply,
         unregisterQuestionApply,
         applyQuestionDefaults,
         registerQuestionValidity,
         unregisterQuestionValidity,
         invalidQuestionIds,
      }),
      [
         registerQuestionSnapshot,
         unregisterQuestionSnapshot,
         getQuestionSnapshot,
         registerQuestionApply,
         unregisterQuestionApply,
         applyQuestionDefaults,
         registerQuestionValidity,
         unregisterQuestionValidity,
         invalidQuestionIds,
      ],
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
