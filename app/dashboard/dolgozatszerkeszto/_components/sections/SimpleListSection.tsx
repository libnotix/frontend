"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SimpleListSectionProps = {
   name: "items" | "groups";
   label: string;
   addLabel: string;
};

export function SimpleListSection({ name, label, addLabel }: SimpleListSectionProps) {
   const { control } = useFormContext();
   const { fields, append, remove } = useFieldArray({ control, name });

   return (
      <div className="mb-8">
         <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4 block">{label}</Label>
         <div className="flex flex-col gap-3">
            {fields.map((field, index) => (
               <div key={field.id} className="flex items-center gap-3">
                  <Controller
                     name={`${name}.${index}.value`}
                     control={control}
                     render={({ field: f }) => (
                        <Input
                           {...f}
                           className="bg-muted/30"
                           onPointerDown={(event) => event.stopPropagation()}
                           placeholder={`${label} ${index + 1}`}
                        />
                     )}
                  />
                  <Button
                     type="button"
                     variant="ghost"
                     size="icon"
                     onPointerDown={(event) => event.stopPropagation()}
                     onClick={() => remove(index)}
                  >
                     <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
               </div>
            ))}
            <Button
               type="button"
               variant="outline"
               className="justify-start gap-2"
               onPointerDown={(event) => event.stopPropagation()}
               onClick={() => append({ value: `${label} ${fields.length + 1}` })}
            >
               <Plus className="h-4 w-4" />
               {addLabel}
            </Button>
         </div>
      </div>
   );
}
