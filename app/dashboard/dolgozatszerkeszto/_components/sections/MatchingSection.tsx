"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

   const adjustIndicesAfterResponseRemoved = (removedIndex: number) => {
      const premises = getValues("premises") as { correctResponseIndices?: number[] }[];
      premises.forEach((_, pIdx) => {
         const key = `premises.${pIdx}.correctResponseIndices` as const;
         const current: number[] = getValues(key) ?? [];
         const next = current
            .filter((i) => i !== removedIndex)
            .map((i) => (i > removedIndex ? i - 1 : i));
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

   return (
      <div className="mb-8">
         <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-6 block">Párosítási lehetőségek</Label>

         {(formState.errors.premises?.message || formState.errors.responses?.message) && (
            <p className="text-sm text-destructive mb-2">
               {[formState.errors.premises?.message, formState.errors.responses?.message].filter(Boolean).join(" ")}
            </p>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-3">
               {premiseFields.map((premiseField, pIndex) => (
                  <div key={premiseField.id} className="flex items-center gap-3 w-full group">
                     <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-muted-foreground w-4 text-right shrink-0">{pIndex + 1}.</span>
                        <div className="grid grid-cols-2 bg-muted/40 rounded-md p-1 border border-border min-w-[40px] min-h-[34px] gap-1 shadow-inner">
                           {responseFields.length === 0 ? (
                              <span className="text-muted-foreground/50 text-[10px] uppercase font-bold flex items-center px-1">...</span>
                           ) : (
                              responseFields.map((_, rIndex) => {
                                 const letter = String.fromCharCode(65 + rIndex);
                                 const selected: number[] = getValues(`premises.${pIndex}.correctResponseIndices`) ?? [];
                                 const isSelected = selected.includes(rIndex);
                                 return (
                                    <button
                                       key={`${premiseField.id}-${rIndex}`}
                                       type="button"
                                       onPointerDown={(e) => e.stopPropagation()}
                                       onClick={() => togglePairing(pIndex, rIndex)}
                                       className={`h-6 w-6 rounded text-xs font-bold transition-all flex items-center justify-center ${
                                          isSelected
                                             ? "bg-primary text-primary-foreground shadow-sm scale-105"
                                             : "text-muted-foreground/60 hover:bg-muted-foreground/10 hover:text-muted-foreground"
                                       }`}
                                       title={String(getValues(`responses.${rIndex}.value`) ?? "")}
                                    >
                                       {letter}
                                    </button>
                                 );
                              })
                           )}
                        </div>
                     </div>
                     <div className="flex-1 border border-border rounded-lg p-2.5 flex items-center bg-card hover:border-muted-foreground transition-colors relative">
                        <Controller
                           name={`premises.${pIndex}.value`}
                           control={control}
                           render={({ field }) => (
                              <Input
                                 {...field}
                                 className="border-none shadow-none bg-transparent font-medium px-2 h-auto focus-visible:ring-0"
                                 onPointerDown={(e) => e.stopPropagation()}
                              />
                           )}
                        />
                        <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                           onPointerDown={(e) => e.stopPropagation()}
                           onClick={() => removePremise(pIndex)}
                        >
                           <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                     </div>
                  </div>
               ))}
               <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => appendPremise({ value: `${premiseFields.length + 1}. Kifejezés`, correctResponseIndices: [] })}
                  className="border-2 border-dashed border-border rounded-lg p-3 flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors font-medium text-sm mt-3 w-full"
               >
                  <Plus className="h-4 w-4" />{"\u00da"}j Kifejezés
               </button>
            </div>

            <div className="flex flex-col gap-3">
               {responseFields.map((responseField, rIndex) => (
                  <div key={responseField.id} className="flex items-center gap-2 w-full group">
                     <span className="font-bold text-muted-foreground w-8 text-right shrink-0">{String.fromCharCode(65 + rIndex)}.</span>
                     <div className="flex-1 border border-border rounded-lg p-2.5 flex items-center bg-card hover:border-muted-foreground transition-colors relative">
                        <Controller
                           name={`responses.${rIndex}.value`}
                           control={control}
                           render={({ field }) => (
                              <Input
                                 {...field}
                                 className="border-none shadow-none bg-transparent font-medium px-2 h-auto focus-visible:ring-0"
                                 onPointerDown={(e) => e.stopPropagation()}
                              />
                           )}
                        />
                        <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                           onPointerDown={(e) => e.stopPropagation()}
                           onClick={() => {
                              adjustIndicesAfterResponseRemoved(rIndex);
                              removeResponse(rIndex);
                           }}
                        >
                           <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                     </div>
                  </div>
               ))}
               <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => appendResponse({ value: `${String.fromCharCode(65 + responseFields.length)}. Magyarázat` })}
                  className="border-2 border-dashed border-border rounded-lg p-3 flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors font-medium text-sm mt-3 w-full"
               >
                  <Plus className="h-4 w-4" />{"\u00da"}j Válasz
               </button>
            </div>
         </div>
      </div>
   );
}
