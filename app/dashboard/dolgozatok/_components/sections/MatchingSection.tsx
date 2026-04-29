"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SectionHeader } from "../SectionHeader";
import { DiffLeaf } from "../aiEdit/diffPrimitives";

type PremiseValue = { value: string; correctResponseIndices?: number[] };
type ResponseValue = { value: string };

export function MatchingSection() {
   const { control, getValues, setValue, formState } = useFormContext();

   const {
      fields: premiseFields,
      append: appendPremise,
      remove: removePremise,
   } = useFieldArray({ control, name: "premises" });

   const {
      fields: responseFields,
      append: appendResponse,
      remove: removeResponse,
   } = useFieldArray({ control, name: "responses" });

   const watchedPremises = (useWatch({ control, name: "premises" }) as PremiseValue[] | undefined) ?? [];
   const watchedResponses = (useWatch({ control, name: "responses" }) as ResponseValue[] | undefined) ?? [];

   const adjustIndicesAfterResponseRemoved = (removedIndex: number) => {
      const premises = getValues("premises") as { correctResponseIndices?: number[] }[];
      premises.forEach((_, pIdx) => {
         const key = `premises.${pIdx}.correctResponseIndices` as const;
         const current: number[] = getValues(key) ?? [];
         const next = current.filter((i) => i !== removedIndex).map((i) => (i > removedIndex ? i - 1 : i));
         setValue(key, next, { shouldValidate: true, shouldDirty: true });
      });
   };

   const togglePairing = (premiseIndex: number, responseIndex: number) => {
      const key = `premises.${premiseIndex}.correctResponseIndices` as const;
      const current: number[] = getValues(key) ?? [];
      const next = current.includes(responseIndex)
         ? current.filter((i) => i !== responseIndex)
         : [...current, responseIndex];
      setValue(key, next, { shouldValidate: true, shouldDirty: true });
   };

   const sectionError = [formState.errors.premises?.message, formState.errors.responses?.message]
      .filter((m): m is string => typeof m === "string" && m.length > 0)
      .join(" ");

   return (
      <div className="mb-5">
         <SectionHeader
            label="Párosítási lehetőségek"
            helper="A bal oldalon a kifejezések, a jobb oldalon a válaszok. A betűkre kattintva állítsd be a helyes párokat."
            error={sectionError || undefined}
         />

         <div className="grid min-w-0 grid-cols-1 items-start gap-6 md:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-3">
               {premiseFields.map((premiseField, pIndex) => {
                  const selected = watchedPremises[pIndex]?.correctResponseIndices ?? [];
                  const selectedLabels = selected
                     .map((idx) => ({ idx, label: watchedResponses[idx]?.value ?? "" }))
                     .filter((s) => s.label.length > 0);

                  return (
                     <div key={premiseField.id} className="group flex min-w-0 flex-col gap-1.5">
                        <div className="flex min-w-0 items-center gap-3">
                           <div className="flex shrink-0 items-center gap-2">
                              <span className="w-4 shrink-0 text-right font-bold text-muted-foreground">
                                 {pIndex + 1}.
                              </span>
                              <div className="grid min-h-[34px] min-w-[40px] grid-cols-2 gap-1 rounded-md border border-border/60 bg-muted/40 p-1 shadow-inner">
                                 {responseFields.length === 0 ? (
                                    <span className="flex items-center px-1 text-[10px] font-bold uppercase text-muted-foreground/50">
                                       …
                                    </span>
                                 ) : (
                                    responseFields.map((_, rIndex) => {
                                       const letter = String.fromCharCode(65 + rIndex);
                                       const isSelected = selected.includes(rIndex);
                                       return (
                                          <button
                                             key={`${premiseField.id}-${rIndex}`}
                                             type="button"
                                             onPointerDown={(e) => e.stopPropagation()}
                                             onClick={() => togglePairing(pIndex, rIndex)}
                                             aria-label={`${letter} válasz párosítása`}
                                             className={cn(
                                                "flex h-6 w-6 items-center justify-center rounded text-xs font-bold transition-all",
                                                isSelected
                                                   ? "scale-105 bg-primary text-primary-foreground shadow-sm"
                                                   : "text-muted-foreground/60 hover:bg-muted-foreground/10 hover:text-muted-foreground",
                                             )}
                                             title={watchedResponses[rIndex]?.value ?? ""}
                                          >
                                             {letter}
                                          </button>
                                       );
                                    })
                                 )}
                              </div>
                           </div>
                           <div className="relative flex min-w-0 flex-1 items-center rounded-lg border border-border/70 bg-card p-2.5 transition-colors hover:border-muted-foreground/60">
                              <Controller
                                 name={`premises.${pIndex}.value`}
                                 control={control}
                                 render={({ field }) => (
                                    <DiffLeaf
                                       path={`premises.${pIndex}.value`}
                                       previewMode="merged"
                                       className="min-w-0 flex-1"
                                    >
                                       <Input
                                          {...field}
                                          className="h-auto min-w-0 border-none bg-transparent py-0 pr-10 pl-2 font-medium shadow-none focus-visible:ring-0"
                                          onPointerDown={(e) => e.stopPropagation()}
                                       />
                                    </DiffLeaf>
                                 )}
                              />
                              <button
                                 type="button"
                                 aria-label="Kifejezés törlése"
                                 title="Kifejezés törlése"
                                 className="absolute right-2 flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                                 onPointerDown={(e) => e.stopPropagation()}
                                 onClick={() => removePremise(pIndex)}
                              >
                                 <Trash2 className="h-4 w-4" />
                              </button>
                           </div>
                        </div>
                        {selectedLabels.length > 0 ? (
                           <div className="ml-7 flex flex-wrap gap-1.5">
                              {selectedLabels.map((s) => (
                                 <span
                                    key={`${premiseField.id}-chip-${s.idx}`}
                                    className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                                 >
                                    <span className="font-semibold">{String.fromCharCode(65 + s.idx)}.</span>
                                    <span className="truncate">{s.label}</span>
                                 </span>
                              ))}
                           </div>
                        ) : null}
                     </div>
                  );
               })}
               <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() =>
                     appendPremise({ value: `${premiseFields.length + 1}. Kifejezés`, correctResponseIndices: [] })
                  }
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 p-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
               >
                  <Plus className="h-4 w-4" /> Új kifejezés
               </button>
            </div>

            <div className="flex min-w-0 flex-col gap-3">
               {responseFields.map((responseField, rIndex) => (
                  <div key={responseField.id} className="group flex min-w-0 w-full items-center gap-2">
                     <span className="w-8 shrink-0 text-right font-bold text-muted-foreground">
                        {String.fromCharCode(65 + rIndex)}.
                     </span>
                     <div className="relative flex min-w-0 flex-1 items-center rounded-lg border border-border/70 bg-card p-2.5 transition-colors hover:border-muted-foreground/60">
                        <Controller
                           name={`responses.${rIndex}.value`}
                           control={control}
                           render={({ field }) => (
                              <DiffLeaf
                                 path={`responses.${rIndex}.value`}
                                 previewMode="merged"
                                 className="min-w-0 flex-1"
                              >
                                 <Input
                                    {...field}
                                    className="h-auto min-w-0 border-none bg-transparent py-0 pr-10 pl-2 font-medium shadow-none focus-visible:ring-0"
                                    onPointerDown={(e) => e.stopPropagation()}
                                 />
                              </DiffLeaf>
                           )}
                        />
                        <button
                           type="button"
                           aria-label="Válasz törlése"
                           title="Válasz törlése"
                           className="absolute right-2 flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                           onPointerDown={(e) => e.stopPropagation()}
                           onClick={() => {
                              adjustIndicesAfterResponseRemoved(rIndex);
                              removeResponse(rIndex);
                           }}
                        >
                           <Trash2 className="h-4 w-4" />
                        </button>
                     </div>
                  </div>
               ))}
               <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() =>
                     appendResponse({ value: `${String.fromCharCode(65 + responseFields.length)}. Magyarázat` })
                  }
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 p-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
               >
                  <Plus className="h-4 w-4" /> Új válasz
               </button>
            </div>
         </div>
      </div>
   );
}
