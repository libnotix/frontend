"use client";

import { Circle, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MultipleChoiceSection() {
   const { control, formState } = useFormContext();
   const { fields, append, remove } = useFieldArray({ control, name: "options" });

   return (
      <div className="mb-8">
         <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4 block">Válaszlehetőségek</Label>

         {formState.errors.options?.message ? (
            <p className="text-sm text-destructive mb-2">{String(formState.errors.options.message)}</p>
         ) : null}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field, index) => (
               <div
                  key={field.id}
                  className="border border-border rounded-lg p-3 flex items-center gap-3 relative group hover:border-muted-foreground transition-colors"
               >
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  <Controller
                     name={`options.${index}.value`}
                     control={control}
                     render={({ field: f, fieldState }) => (
                        <>
                           <Input
                              {...f}
                              className="border-none shadow-none bg-transparent font-medium px-0 h-auto focus-visible:ring-0"
                              onPointerDown={(e) => e.stopPropagation()}
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
                     className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                     onPointerDown={(e) => e.stopPropagation()}
                     onClick={() => remove(index)}
                  >
                     <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
               </div>
            ))}
            <button
               type="button"
               onPointerDown={(e) => e.stopPropagation()}
               onClick={() => append({ value: `Teszt ${fields.length + 1}` })}
               className="border-2 border-dashed border-border rounded-lg p-3 flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors font-medium text-sm"
            >
               <Plus className="h-4 w-4" /> Válaszlehetőség hozzáadása
            </button>
         </div>
      </div>
   );
}
