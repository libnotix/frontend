"use client";

import { Check, Circle, Plus, Square, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SectionHeader } from "../SectionHeader";
import { DiffLeaf, DiffListRow } from "../aiEdit/diffPrimitives";
import { useExamCardDiff } from "../aiEdit/ExamCardDiffContext";

function newOptionId(): string {
   return `opt_${Math.random().toString(36).slice(2, 11)}`;
}

type MultipleChoiceSectionProps = {
   mode: "radio" | "checkbox";
};

export function MultipleChoiceSection({ mode }: MultipleChoiceSectionProps) {
   const { control, formState, getValues, setValue } = useFormContext();
   const { fields, append, remove } = useFieldArray({ control, name: "options" });
   const aiDiff = useExamCardDiff();
   const extraOptionIds = aiDiff?.getAddedStableIdsUnder("options") ?? [];

   const watchedOptions = useWatch({ control, name: "options" }) as { id: string; label: string }[] | undefined;
   const correctOptionId = useWatch({ control, name: "correctOptionId" }) as string | undefined;
   const correctOptionIds = (useWatch({ control, name: "correctOptionIds" }) as string[] | undefined) ?? [];

   const removeOptionAt = (index: number) => {
      const removedId = getValues(`options.${index}.id`) as string | undefined;
      remove(index);
      queueMicrotask(() => {
         const rest = getValues("options") as { id: string; label: string }[] | undefined;
         if (!rest?.length) return;

         if (mode === "radio") {
            const cur = getValues("correctOptionId") as string | undefined;
            if (removedId && cur === removedId) {
               setValue("correctOptionId", rest[0].id, { shouldValidate: true, shouldDirty: true });
            }
         } else {
            const next = (getValues("correctOptionIds") as string[] | undefined)?.filter((id) => id !== removedId) ?? [];
            setValue("correctOptionIds", next.length ? next : [rest[0].id], { shouldValidate: true, shouldDirty: true });
         }
      });
   };

   const optionsError =
      typeof formState.errors.options?.message === "string" ? formState.errors.options.message : undefined;
   const correctRadioError =
      mode === "radio" && typeof formState.errors.correctOptionId?.message === "string"
         ? formState.errors.correctOptionId.message
         : undefined;
   const correctCheckboxError =
      mode === "checkbox" && typeof formState.errors.correctOptionIds?.message === "string"
         ? formState.errors.correctOptionIds.message
         : undefined;
   const sectionError = optionsError ?? correctRadioError ?? correctCheckboxError;

   return (
      <div className="mb-5">
         <SectionHeader
            label="Válaszlehetőségek"
            helper={
               mode === "radio"
                  ? "Kattints egy lehetőségre – pontosan egy helyes válasz jelölhető meg."
                  : "Kattints a lehetőségekre – több helyes válasz is megjelölhető."
            }
            error={sectionError}
         />

         <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {fields.map((field, index) => {
               const optionId = watchedOptions?.[index]?.id;
               const isRadioCorrect = mode === "radio" && optionId != null && correctOptionId === optionId;
               const isCheckboxCorrect = mode === "checkbox" && optionId != null && correctOptionIds.includes(optionId);
               const isCorrect = isRadioCorrect || isCheckboxCorrect;

               const correctnessLeaf = aiDiff?.getDiffAt(`options.${index}.correct`) ?? null;
               const proposedGainsCorrect =
                  correctnessLeaf?.kind === "changed" && correctnessLeaf.after === true;
               const proposedLosesCorrect =
                  correctnessLeaf?.kind === "changed" && correctnessLeaf.after === false;

               return (
                  <DiffListRow key={field.id} basePath="options" rowIndex={index}>
                  <div
                     className={cn(
                        "group relative flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                        isCorrect
                           ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                           : "border-border/70 hover:border-muted-foreground/60 hover:bg-muted/20",
                        proposedGainsCorrect &&
                           "border-emerald-500/55 bg-emerald-500/10 ring-1 ring-emerald-500/40",
                        proposedLosesCorrect && "opacity-80",
                     )}
                     role="button"
                     tabIndex={0}
                     onKeyDown={(e) => {
                        if (e.target !== e.currentTarget) return;
                        if (e.key === "Enter" || e.key === " ") {
                           e.preventDefault();
                           e.currentTarget.click();
                        }
                     }}
                     onClick={() => {
                        if (!optionId) return;
                        if (mode === "radio") {
                           setValue("correctOptionId", optionId, { shouldValidate: true, shouldDirty: true });
                        } else {
                           const current = (getValues("correctOptionIds") as string[] | undefined) ?? [];
                           const next = current.includes(optionId)
                              ? current.filter((id) => id !== optionId)
                              : [...current, optionId];
                           setValue("correctOptionIds", next.length ? next : [optionId], {
                              shouldValidate: true,
                              shouldDirty: true,
                           });
                        }
                     }}
                  >
                     {mode === "radio" ? (
                        proposedGainsCorrect ? (
                           <Circle className="h-5 w-5 shrink-0 fill-emerald-500 text-emerald-500" />
                        ) : proposedLosesCorrect ? (
                           <Circle className="h-5 w-5 shrink-0 fill-muted-foreground/40 text-muted-foreground/60 line-through" />
                        ) : isRadioCorrect ? (
                           <Circle className="h-5 w-5 shrink-0 fill-primary text-primary" />
                        ) : (
                           <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                        )
                     ) : proposedGainsCorrect ? (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-emerald-500 bg-emerald-500 text-white">
                           <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </div>
                     ) : proposedLosesCorrect ? (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-muted-foreground/50 bg-muted-foreground/20 text-muted-foreground/70">
                           <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </div>
                     ) : isCheckboxCorrect ? (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-primary bg-primary text-primary-foreground">
                           <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </div>
                     ) : (
                        <Square className="h-5 w-5 shrink-0 text-muted-foreground" />
                     )}
                     <Controller
                        name={`options.${index}.label`}
                        control={control}
                        render={({ field: f, fieldState }) => (
                           <DiffLeaf path={`options.${index}.label`} className="min-w-0 flex-1">
                              <>
                                 <Input
                                    {...f}
                                    className="h-auto min-w-0 w-full border-none bg-transparent px-0 py-0 font-medium shadow-none focus-visible:ring-0"
                                    placeholder={`Lehetőség ${index + 1}`}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                 />
                                 {fieldState.error?.message ? (
                                    <span className="absolute -bottom-4 left-9 text-[11px] text-destructive">
                                       {fieldState.error.message}
                                    </span>
                                 ) : null}
                              </>
                           </DiffLeaf>
                        )}
                     />
                     <button
                        type="button"
                        aria-label="Lehetőség törlése"
                        title="Lehetőség törlése"
                        className="ml-auto flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                           e.stopPropagation();
                           removeOptionAt(index);
                        }}
                     >
                        <Trash2 className="h-4 w-4" />
                     </button>
                  </div>
                  </DiffListRow>
               );
            })}
            {extraOptionIds.map((oid) => (
               <DiffLeaf key={`ghost-${oid}`} path={`options.__added.${oid}.label`}>
                  <div className="opacity-95" aria-hidden />
               </DiffLeaf>
            ))}
            <button
               type="button"
               onPointerDown={(e) => e.stopPropagation()}
               onClick={() => {
                  const id = newOptionId();
                  append({ id, label: `Lehetőség ${fields.length + 1}` });
               }}
               className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 p-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
            >
               <Plus className="h-4 w-4" /> Válaszlehetőség hozzáadása
            </button>
         </div>
      </div>
   );
}
