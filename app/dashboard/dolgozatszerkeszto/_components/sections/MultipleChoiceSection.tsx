"use client";

import { Check, Circle, Plus, Square, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function newOptionId(): string {
   return `opt_${Math.random().toString(36).slice(2, 11)}`;
}

type MultipleChoiceSectionProps = {
   mode: "radio" | "checkbox";
};

export function MultipleChoiceSection({ mode }: MultipleChoiceSectionProps) {
   const { control, formState, getValues, setValue } = useFormContext();
   const { fields, append, remove } = useFieldArray({ control, name: "options" });

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

   return (
      <div className="mb-8">
         <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1 block">Válaszlehetőségek</Label>
         <p className="text-sm text-muted-foreground mb-4">
            {mode === "radio"
               ? "Kattints egy lehetőségre: pontosan egy helyes válasz jelölhető meg."
               : "Kattints a lehetőségekre: több helyes válasz is megjelölhető."}
         </p>

         {formState.errors.options?.message ? (
            <p className="text-sm text-destructive mb-2">{String(formState.errors.options.message)}</p>
         ) : null}
         {mode === "radio" && formState.errors.correctOptionId?.message ? (
            <p className="text-sm text-destructive mb-2">{String(formState.errors.correctOptionId.message)}</p>
         ) : null}
         {mode === "checkbox" && formState.errors.correctOptionIds?.message ? (
            <p className="text-sm text-destructive mb-2">{String(formState.errors.correctOptionIds.message)}</p>
         ) : null}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field, index) => {
               const optionId = watchedOptions?.[index]?.id;
               const isRadioCorrect = mode === "radio" && optionId != null && correctOptionId === optionId;
               const isCheckboxCorrect = mode === "checkbox" && optionId != null && correctOptionIds.includes(optionId);

               return (
                  <div
                     key={field.id}
                     className={`border rounded-lg p-3 flex items-center gap-3 relative group transition-colors cursor-pointer ${
                        mode === "radio" && isRadioCorrect
                           ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                           : mode === "checkbox" && isCheckboxCorrect
                             ? "border-primary ring-2 ring-primary/15 bg-primary/5"
                             : "border-border hover:border-muted-foreground"
                     }`}
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
                        isRadioCorrect ? (
                           <Circle className="h-5 w-5 text-primary shrink-0 fill-primary" />
                        ) : (
                           <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                        )
                     ) : isCheckboxCorrect ? (
                        <div className="h-5 w-5 shrink-0 flex items-center justify-center rounded border border-primary bg-primary text-primary-foreground">
                           <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </div>
                     ) : (
                        <Square className="h-5 w-5 text-muted-foreground shrink-0" />
                     )}
                     <Controller
                        name={`options.${index}.label`}
                        control={control}
                        render={({ field: f, fieldState }) => (
                           <>
                              <Input
                                 {...f}
                                 className="border-none shadow-none bg-transparent font-medium px-0 h-auto focus-visible:ring-0 flex-1"
                                 onPointerDown={(e) => e.stopPropagation()}
                                 onClick={(e) => e.stopPropagation()}
                                 onKeyDown={(e) => e.stopPropagation()}
                              />
                              {fieldState.error?.message ? (
                                 <span className="absolute -bottom-5 left-8 text-xs text-destructive">{fieldState.error.message}</span>
                              ) : null}
                           </>
                        )}
                     />
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                           e.stopPropagation();
                           removeOptionAt(index);
                        }}
                     >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                     </Button>
                  </div>
               );
            })}
            <button
               type="button"
               onPointerDown={(e) => e.stopPropagation()}
               onClick={() => {
                  const id = newOptionId();
                  append({ id, label: `Lehetőség ${fields.length + 1}` });
               }}
               className="border-2 border-dashed border-border rounded-lg p-3 flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors font-medium text-sm"
            >
               <Plus className="h-4 w-4" /> Válaszlehetőség hozzáadása
            </button>
         </div>
      </div>
   );
}
