"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useSortable } from "@dnd-kit/react/sortable";
import { CANVAS_SORTABLE_GROUP } from "./constants";
import { EXAM_TASK_TYPE, type ExamTaskTypeId } from "./examTaskTypes";
import { QuestionCardFooter } from "./QuestionCardFooter";
import { QuestionCardHeader } from "./QuestionCardHeader";
import { QuestionInactivePreview } from "./QuestionInactivePreview";
import { QuestionHeaderFields } from "./form/QuestionHeaderFields";
import { getQuestionFormConfig } from "./form/questionFormRegistry";
import { MatchingSection } from "./sections/MatchingSection";
import { MultipleChoiceSection } from "./sections/MultipleChoiceSection";
import { FillInTheBlankSection } from "./sections/FillInTheBlankSection";
import { SimpleListSection } from "./sections/SimpleListSection";
import { GroupingEditorSection } from "./sections/GroupingEditorSection";
import { TextAnswerSection } from "./sections/TextAnswerSection";
import { TrueFalseSection } from "./sections/TrueFalseSection";
import { useExamSave } from "./examSaveContext";
import { formValuesToExamSnapshot } from "./form/examQuestionFormToSnapshot";
import { serverQuestionToFormDefaults } from "./form/serverQuestionToFormDefaults";
import { cn } from "@/lib/utils";
import { buildAllAddedDiff, computeExamFormDiff, snapshotToComparableForm, type FieldDiffMap } from "./aiEdit/diffEngine";
import { ExamCardDiffProvider } from "./aiEdit/ExamCardDiffContext";
import { ExamAiDeleteWash, ExamAiEditOverlay } from "./aiEdit/ExamAiEditOverlay";
import { coerceExamTaskTypeId, yamlToFormDefaults } from "./aiEdit/yamlClient";
import { usePendingExamEditsStore } from "./aiEdit/pendingExamEditsStore";

type SortableQuestionItemProps = {
   id: string;
   typeId: ExamTaskTypeId;
   /** GET /exams/{id} kérdés objektum — űrlap és mentés-snapshot id-k visszaállításához */
   loadedQuestion?: unknown;
   index: number;
   onDelete?: () => void;
   onDuplicate?: () => void;
   onMoveToTop?: () => void;
   canMoveToTop?: boolean;
   onQuestionChange?: () => void;
   /** Shown above the card when dragging from the palette over this row */
   paletteInsertIndicator?: ReactNode;
   examId?: number | null;
   /** Create-preview cards: links to `ExamQuestionEdit.operationId`. */
   ghostOperationId?: string;
};

export function SortableQuestionItem({
   id,
   typeId,
   loadedQuestion,
   index,
   onDelete,
   onDuplicate,
   onMoveToTop,
   canMoveToTop = true,
   onQuestionChange,
   paletteInsertIndicator,
   examId,
   ghostOperationId,
}: SortableQuestionItemProps) {
   const {
      registerQuestionSnapshot,
      unregisterQuestionSnapshot,
      registerQuestionApply,
      unregisterQuestionApply,
      getQuestionSnapshot,
      registerQuestionValidity,
      unregisterQuestionValidity,
   } = useExamSave();
   const { resolver, defaultValues } = useMemo(() => getQuestionFormConfig(typeId), [typeId]);
   const formMethods = useForm({
      resolver,
      defaultValues,
      mode: "all",
   });
   const {
      control,
      formState: { isDirty, isValid, touchedFields },
      getValues,
      reset,
      trigger,
   } = formMethods;
   const watchedValues = useWatch({ control });
   const hasObservedInitialValuesRef = useRef(false);
   const [isCollapsed, setIsCollapsed] = useState(false);

   const loadedRef = useRef(loadedQuestion);
   useEffect(() => {
      loadedRef.current = loadedQuestion;
   }, [loadedQuestion]);

   useEffect(() => {
      if (loadedQuestion == null) return;
      const mapped = serverQuestionToFormDefaults(typeId, loadedQuestion);
      if (mapped && Object.keys(mapped).length > 0) {
         reset({ ...defaultValues, ...mapped } as never);
         void trigger();
      }
   }, [loadedQuestion, typeId, defaultValues, reset, trigger]);

   useEffect(() => {
      void trigger();
   }, [trigger]);

   useLayoutEffect(() => {
      const getter = () => formValuesToExamSnapshot(typeId, getValues() as Record<string, unknown>, loadedRef.current);
      registerQuestionSnapshot(id, getter);
      return () => unregisterQuestionSnapshot(id);
   }, [getValues, id, registerQuestionSnapshot, unregisterQuestionSnapshot, typeId]);

   useLayoutEffect(() => {
      const applyFn = (formDefaults: Record<string, unknown>) => {
         reset({ ...defaultValues, ...formDefaults } as never);
         void trigger();
      };
      registerQuestionApply(id, applyFn);
      return () => {
         unregisterQuestionApply(id);
      };
   }, [defaultValues, id, registerQuestionApply, unregisterQuestionApply, reset, trigger]);

   useEffect(() => {
      registerQuestionValidity(id, isValid);
   }, [id, isValid, registerQuestionValidity]);

   useEffect(() => {
      return () => unregisterQuestionValidity(id);
   }, [id, unregisterQuestionValidity]);

   useEffect(() => {
      if (!hasObservedInitialValuesRef.current) {
         hasObservedInitialValuesRef.current = true;
         return;
      }
      onQuestionChange?.();
   }, [onQuestionChange, watchedValues]);

   const { ref, handleRef, isDragging } = useSortable({
      id,
      index,
      group: CANVAS_SORTABLE_GROUP,
      disabled: Boolean(ghostOperationId),
   });

   const hasInteracted = isDirty || Object.keys(touchedFields).length > 0;
   const validationTone = !hasInteracted
      ? "border-border/60"
      : isValid
        ? "border-primary/35"
        : "border-destructive/60";

   const pendingOp = usePendingExamEditsStore((s) =>
      examId ? s.getPendingForCard(examId, { canvasId: id, ghostOperationId }) : undefined,
   );
   const acceptEdit = usePendingExamEditsStore((s) => s.acceptEdit);
   const rejectEdit = usePendingExamEditsStore((s) => s.rejectEdit);

   const diffMap: FieldDiffMap | null = useMemo(() => {
      if (!pendingOp || !examId) return null;
      const yamlType = coerceExamTaskTypeId(pendingOp.type as string | null) ?? typeId;
      if (pendingOp.op === "update") {
         if (!pendingOp.yaml?.trim()) return null;
         const cur = snapshotToComparableForm(typeId, getQuestionSnapshot(id));
         const parsed = yamlToFormDefaults(yamlType, pendingOp.yaml);
         if (!parsed.ok) return null;
         return computeExamFormDiff(typeId, cur, parsed.values);
      }
      if (pendingOp.op === "create") {
         if (!pendingOp.yaml?.trim()) return null;
         const parsed = yamlToFormDefaults(yamlType, pendingOp.yaml);
         if (!parsed.ok) return null;
         return buildAllAddedDiff(yamlType, parsed.values);
      }
      return null;
   }, [pendingOp, examId, typeId, id, getQuestionSnapshot]);

   const showDiffProvider = !!diffMap && (pendingOp?.op === "update" || pendingOp?.op === "create");

   const bodyContent = (
      <>
               <QuestionCardHeader
                  index={index}
                  typeId={typeId}
                  isCollapsed={isCollapsed}
                  onToggleCollapsed={() => setIsCollapsed((c) => !c)}
                  isValid={isValid}
                  hasInteracted={hasInteracted}
                  isDragging={isDragging}
                  handleRef={handleRef}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onMoveToTop={onMoveToTop}
                  canMoveToTop={canMoveToTop}
               />

               {isCollapsed ? (
                  <div className="px-4 py-3 md:px-5">
                     <QuestionInactivePreview typeId={typeId} />
                  </div>
               ) : null}

               <div
                  className={cn(
                     "relative z-1 px-4 pb-4 pt-4 md:px-5 md:pb-5",
                     isCollapsed && "hidden",
                  )}
               >
                  {pendingOp?.op === "delete" ? <ExamAiDeleteWash /> : null}
                  <QuestionHeaderFields />

                  {typeId === EXAM_TASK_TYPE.Radio && <MultipleChoiceSection mode="radio" />}
                  {typeId === EXAM_TASK_TYPE.Checkbox && <MultipleChoiceSection mode="checkbox" />}
                  {typeId === EXAM_TASK_TYPE.TrueFalse && <TrueFalseSection />}
                  {typeId === EXAM_TASK_TYPE.ShortAnswer && <TextAnswerSection variant="short" />}
                  {typeId === EXAM_TASK_TYPE.Matching && <MatchingSection />}
                  {typeId === EXAM_TASK_TYPE.Ordering && (
                     <SimpleListSection
                        name="items"
                        label="Sorbarendezendő elemek"
                        addLabel="Elem hozzáadása"
                        helper="A megadott sorrend lesz a helyes válasz – a diákok ezt fogják sorba állítani."
                     />
                  )}
                  {typeId === EXAM_TASK_TYPE.Grouping && <GroupingEditorSection />}
                  {typeId === EXAM_TASK_TYPE.FillInTheBlank && <FillInTheBlankSection />}
                  {typeId === EXAM_TASK_TYPE.LongAnswer && <TextAnswerSection variant="long" />}

                  <QuestionCardFooter />
               </div>
      </>
   );

   return (
      <FormProvider {...formMethods}>
         <div ref={ref} className={cn("relative w-full cursor-default", isDragging && "opacity-50")}>
            {paletteInsertIndicator}
            <div
               className={cn(
                  "bg-card text-card-foreground relative w-full overflow-hidden rounded-xl border shadow-sm transition-colors",
                  validationTone,
               )}
            >
               {examId && pendingOp ? (
                  <ExamAiEditOverlay
                     op={pendingOp}
                     diffMap={diffMap ?? undefined}
                     onAccept={() => examId && acceptEdit(examId, pendingOp.operationId)}
                     onReject={() => examId && rejectEdit(examId, pendingOp.operationId)}
                  />
               ) : null}
               {showDiffProvider && diffMap ? (
                  <ExamCardDiffProvider diffMap={diffMap}>{bodyContent}</ExamCardDiffProvider>
               ) : (
                  bodyContent
               )}
            </div>
         </div>
      </FormProvider>
   );
}
