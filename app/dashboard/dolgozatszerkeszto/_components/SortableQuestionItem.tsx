"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSortable } from "@dnd-kit/react/sortable";
import { CANVAS_SORTABLE_GROUP } from "./constants";
import { EXAM_TASK_TYPE, type ExamTaskTypeId } from "./examTaskTypes";
import { QuestionCardFooter } from "./QuestionCardFooter";
import { QuestionInactivePreview } from "./QuestionInactivePreview";
import { QuestionHeaderFields } from "./form/QuestionHeaderFields";
import { getQuestionFormConfig } from "./form/questionFormRegistry";
import { SortableDragHandle } from "./SortableDragHandle";
import { MatchingSection } from "./sections/MatchingSection";
import { MultipleChoiceSection } from "./sections/MultipleChoiceSection";
import { FillInTheBlankSection } from "./sections/FillInTheBlankSection";
import { SimpleListSection } from "./sections/SimpleListSection";
import { TextAnswerSection } from "./sections/TextAnswerSection";
import { TrueFalseSection } from "./sections/TrueFalseSection";
import { useExamSave } from "./examSaveContext";
import { formValuesToExamSnapshot } from "./form/examQuestionFormToSnapshot";
import { serverQuestionToFormDefaults } from "./form/serverQuestionToFormDefaults";

type SortableQuestionItemProps = {
   id: string;
   typeId: ExamTaskTypeId;
   /** GET /exams/{id} kérdés objektum — űrlap és mentés-snapshot id-k visszaállításához */
   loadedQuestion?: unknown;
   index: number;
   isActive?: boolean;
   onDelete?: () => void;
   /** Shown above the card when dragging from the palette over this row */
   paletteInsertIndicator?: ReactNode;
};

export function SortableQuestionItem({
   id,
   typeId,
   loadedQuestion,
   index,
   isActive = true,
   onDelete,
   paletteInsertIndicator,
}: SortableQuestionItemProps) {
   const { registerQuestionSnapshot, unregisterQuestionSnapshot } = useExamSave();
   const { resolver, defaultValues } = useMemo(() => getQuestionFormConfig(typeId), [typeId]);
   const formMethods = useForm({
      resolver,
      defaultValues,
      mode: "onBlur",
   });
   const { getValues, reset } = formMethods;

   const loadedRef = useRef(loadedQuestion);
   useEffect(() => {
      loadedRef.current = loadedQuestion;
   }, [loadedQuestion]);

   useEffect(() => {
      if (loadedQuestion == null) return;
      const mapped = serverQuestionToFormDefaults(typeId, loadedQuestion);
      if (mapped && Object.keys(mapped).length > 0) {
         reset({ ...defaultValues, ...mapped } as never);
      }
   }, [loadedQuestion, typeId, defaultValues, reset]);

   useLayoutEffect(() => {
      const getter = () => formValuesToExamSnapshot(typeId, getValues() as Record<string, unknown>, loadedRef.current);
      registerQuestionSnapshot(id, getter);
      return () => unregisterQuestionSnapshot(id);
   }, [getValues, id, registerQuestionSnapshot, unregisterQuestionSnapshot, typeId]);

   const { ref, handleRef, isDragging } = useSortable({
      id,
      index,
      group: CANVAS_SORTABLE_GROUP,
   });

   return (
      <FormProvider {...formMethods}>
         <div ref={ref} className={`relative w-full pb-6 cursor-default ${isDragging ? "opacity-50" : ""}`}>
            {paletteInsertIndicator}
            <div
               className={`bg-card text-card-foreground p-6 w-full rounded-xl border-2 relative shadow-sm transition-colors ${isActive ? "border-primary" : "border-border"}`}
            >
               <div className="absolute -left-3 top-8 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
                  {index + 1}
               </div>

               {isActive ? (
                  <>
                     <QuestionHeaderFields />

                     {typeId === EXAM_TASK_TYPE.Radio && <MultipleChoiceSection mode="radio" />}

                     {typeId === EXAM_TASK_TYPE.Checkbox && <MultipleChoiceSection mode="checkbox" />}

                     {typeId === EXAM_TASK_TYPE.TrueFalse && <TrueFalseSection />}

                     {typeId === EXAM_TASK_TYPE.ShortAnswer && (
                        <TextAnswerSection label="Válasz" placeholder="Mintaválasz vagy megjegyzés (opcionális)..." />
                     )}

                     {typeId === EXAM_TASK_TYPE.Matching && <MatchingSection />}

                     {typeId === EXAM_TASK_TYPE.Ordering && (
                        <SimpleListSection name="items" label="Sorbarendezendő elemek" addLabel="Elem hozzáadása" />
                     )}

                     {typeId === EXAM_TASK_TYPE.Grouping && (
                        <>
                           <SimpleListSection name="groups" label="Csoportok" addLabel="Csoport hozzáadása" />
                           <SimpleListSection name="items" label="Besorolandó elemek" addLabel="Elem hozzáadása" />
                        </>
                     )}

                     {typeId === EXAM_TASK_TYPE.FillInTheBlank && <FillInTheBlankSection />}

                     {typeId === EXAM_TASK_TYPE.LongAnswer && (
                        <TextAnswerSection
                           label="Értékelési útmutató"
                           placeholder="Kulcspontok, szöveghossz, követelmények..."
                           helper="A hosszú válasz típusnál legalább egy rövid útmutató megadása kötelező."
                        />
                     )}

                     <QuestionCardFooter onDelete={onDelete} />
                  </>
               ) : (
                  <QuestionInactivePreview typeId={typeId} />
               )}

               <SortableDragHandle handleRef={handleRef} />
            </div>
         </div>
      </FormProvider>
   );
}
