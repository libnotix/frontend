"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function FillInTheBlankSection() {
   const { control } = useFormContext();
   const { fields, append, remove } = useFieldArray({ control, name: "blanks" });

   return (
      <div className="mb-8 space-y-4">
         <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Lyukas szöveg</Label>

         <Controller
            name="leadText"
            control={control}
            render={({ field }) => (
               <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Bevezető szöveg (opcionális)"
                  className="resize-none h-24 bg-muted/30"
                  onPointerDown={(event) => event.stopPropagation()}
               />
            )}
         />

         <div className="space-y-3">
            {fields.map((field, index) => (
               <div key={field.id} className="rounded-lg border p-3 space-y-2">
                  <Controller
                     name={`blanks.${index}.text`}
                     control={control}
                     render={({ field: inputField }) => (
                        <Input
                           {...inputField}
                           placeholder={`Lyuk ${index + 1} környező szövege`}
                           onPointerDown={(event) => event.stopPropagation()}
                        />
                     )}
                  />
                  <Controller
                     name={`blanks.${index}.acceptedAnswers.0`}
                     control={control}
                     render={({ field: answerField }) => (
                        <Input
                           {...answerField}
                           placeholder="Elfogadott válasz"
                           onPointerDown={(event) => event.stopPropagation()}
                        />
                     )}
                  />
                  <Button type="button" variant="ghost" onClick={() => remove(index)} className="gap-2">
                     <Trash2 className="h-4 w-4" />
                     Lyuk törlése
                  </Button>
               </div>
            ))}
         </div>

         <Button type="button" variant="outline" className="gap-2" onClick={() => append({ text: "", acceptedAnswers: [""] })}>
            <Plus className="h-4 w-4" />
            Lyuk hozzáadása
         </Button>
      </div>
   );
}
