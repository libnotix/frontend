"use client";

import { useMemo, type ReactNode } from "react";
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
import { TextAnswerSection } from "./sections/TextAnswerSection";
import { TrueFalseSection } from "./sections/TrueFalseSection";

type SortableQuestionItemProps = {
   id: string;
   typeId: ExamTaskTypeId;
   index: number;
   isActive?: boolean;
   onDelete?: () => void;
   /** Shown above the card when dragging from the palette over this row */
   paletteInsertIndicator?: ReactNode;
};

export function SortableQuestionItem({
   id,
   typeId,
   index,
   isActive = true,
   onDelete,
   paletteInsertIndicator,
}: SortableQuestionItemProps) {
   const { resolver, defaultValues } = useMemo(() => getQuestionFormConfig(typeId), [typeId]);
   const formMethods = useForm({
      resolver,
      defaultValues,
      mode: "onBlur",
   });

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

                     {typeId === EXAM_TASK_TYPE.MultipleChoice && <MultipleChoiceSection />}

                     {typeId === EXAM_TASK_TYPE.TrueFalse && <TrueFalseSection />}

                     {typeId === EXAM_TASK_TYPE.ShortAnswer && (
                        <TextAnswerSection label="Válasz" placeholder="Mintaválasz vagy megjegyzés (opcionális)..." />
                     )}

                     {typeId === EXAM_TASK_TYPE.Matching && <MatchingSection />}

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
