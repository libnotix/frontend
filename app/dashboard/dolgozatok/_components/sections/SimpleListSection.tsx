"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "../SectionHeader";
import { DiffLeaf } from "../aiEdit/diffPrimitives";

type SimpleListSectionProps = {
   name: "items" | "groups";
   label: string;
   addLabel: string;
   /** Optional one-line helper to set teacher expectations (e.g. how the order/list will be used). */
   helper?: string;
   /** Called after a row is removed, with that row’s index (e.g. to fix dependent fields). */
   onAfterRemove?: (removedIndex: number) => void;
};

export function SimpleListSection({ name, label, addLabel, helper, onAfterRemove }: SimpleListSectionProps) {
   const { control } = useFormContext();
   const { fields, append, remove } = useFieldArray({ control, name });

   return (
      <div className="mb-5">
         <SectionHeader label={label} helper={helper} />
         <div className="flex flex-col gap-2">
            {fields.map((field, index) => (
               <div key={field.id} className="group flex items-center gap-2">
                  <Controller
                     name={`${name}.${index}.value`}
                     control={control}
                     render={({ field: f }) => (
                        <DiffLeaf path={`${name}.${index}.value`} previewMode="merged">
                           <Input
                              {...f}
                              className="bg-muted"
                              onPointerDown={(event) => event.stopPropagation()}
                              placeholder={`${label} ${index + 1}`}
                           />
                        </DiffLeaf>
                     )}
                  />
                  <button
                     type="button"
                     aria-label="Elem törlése"
                     title="Elem törlése"
                     className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                     onPointerDown={(event) => event.stopPropagation()}
                     onClick={() => {
                        remove(index);
                        onAfterRemove?.(index);
                     }}
                  >
                     <Trash2 className="h-4 w-4" />
                  </button>
               </div>
            ))}
            <button
               type="button"
               className="mt-1 inline-flex items-center justify-center gap-2 self-start rounded-lg border border-dashed border-border/70 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
               onPointerDown={(event) => event.stopPropagation()}
               onClick={() => append({ value: `${label} ${fields.length + 1}` })}
            >
               <Plus className="h-4 w-4" />
               {addLabel}
            </button>
         </div>
      </div>
   );
}
