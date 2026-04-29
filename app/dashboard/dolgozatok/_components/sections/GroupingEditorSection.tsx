"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SectionHeader } from "../SectionHeader";
import { DiffLeaf } from "../aiEdit/diffPrimitives";
import { SimpleListSection } from "./SimpleListSection";

export function GroupingEditorSection() {
   const { control, getValues, setValue } = useFormContext();

   const adjustItemGroupIndicesAfterGroupRemoved = (removedIndex: number) => {
      const items = getValues("items") as unknown[] | undefined;
      if (!Array.isArray(items)) return;
      items.forEach((_, i) => {
         const key = `items.${i}.correctGroupIndex` as const;
         let v = getValues(key) as unknown;
         if (typeof v !== "number" || !Number.isFinite(v)) v = 0;
         let next = v as number;
         if (next === removedIndex) next = 0;
         else if (next > removedIndex) next -= 1;
         setValue(key, next, { shouldValidate: true, shouldDirty: true });
      });
   };

   const {
      fields: itemFields,
      append: appendItem,
      remove: removeItem,
   } = useFieldArray({ control, name: "items" });

   const watchedGroups = (useWatch({ control, name: "groups" }) as { value?: string }[] | undefined) ?? [];

   return (
      <>
         <SimpleListSection
            name="groups"
            label="Csoportok"
            addLabel="Csoport hozzáadása"
            helper="Add meg azokat a csoportokat, amelyekbe a diákok az elemeket sorolják."
            onAfterRemove={adjustItemGroupIndicesAfterGroupRemoved}
         />

         <div className="mb-5">
            <SectionHeader
               label="Besorolandó elemek"
               helper="Minden elemhez válaszd ki, melyik csoportba tartozik helyesen — ez alapján történik az automatikus javítás."
            />
            <div className="flex flex-col gap-2">
               {itemFields.map((field, index) => (
                  <div key={field.id} className="group flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
                     <Controller
                        name={`items.${index}.value`}
                        control={control}
                        render={({ field: f }) => (
                           <DiffLeaf path={`items.${index}.value`} previewMode="merged" className="min-w-0 flex-1">
                              <Input
                                 {...f}
                                 className="min-w-0 bg-muted"
                                 onPointerDown={(e) => e.stopPropagation()}
                                 placeholder={`Elem ${index + 1}`}
                              />
                           </DiffLeaf>
                        )}
                     />
                     <DiffLeaf path={`items.${index}.correctGroupIndex`} previewMode="merged" className="shrink-0">
                        <Controller
                           name={`items.${index}.correctGroupIndex`}
                           control={control}
                           render={({ field: f }) => (
                              <select
                                 {...f}
                                 value={f.value === undefined || f.value === null ? "" : String(f.value)}
                                 onChange={(e) => {
                                    const raw = e.target.value;
                                    f.onChange(raw === "" ? 0 : Number(raw));
                                 }}
                                 onPointerDown={(e) => e.stopPropagation()}
                                 className={cn(
                                    "h-9 min-w-[10rem] rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-sm",
                                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                                 )}
                                 aria-label="Helyes csoport"
                              >
                                 {watchedGroups.map((g, gi) => (
                                    <option key={gi} value={gi}>
                                       {g.value?.trim() ? g.value : `Csoport ${gi + 1}`}
                                    </option>
                                 ))}
                              </select>
                           )}
                        />
                     </DiffLeaf>
                     <button
                        type="button"
                        aria-label="Elem törlése"
                        title="Elem törlése"
                        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => removeItem(index)}
                     >
                        <Trash2 className="h-4 w-4" />
                     </button>
                  </div>
               ))}
               <button
                  type="button"
                  className="mt-1 inline-flex items-center justify-center gap-2 self-start rounded-lg border border-dashed border-border/70 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() =>
                     appendItem({
                        value: `Elem ${itemFields.length + 1}`,
                        correctGroupIndex: 0,
                     })
                  }
               >
                  <Plus className="h-4 w-4" />
                  Elem hozzáadása
               </button>
            </div>
         </div>
      </>
   );
}
