"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function QuestionHeaderFields() {
   const { control, formState } = useFormContext();

   return (
      <>
         <div className="flex items-center justify-between">
            <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center">Kérdés</div>
         </div>
         <div className="mb-6">
            <Controller
               name="title"
               control={control}
               render={({ field }) => (
                  <Input
                     {...field}
                     className="text-lg font-semibold py-6 border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
                     placeholder="Kattintson ide, majd adja meg a feladat címét"
                  />
               )}
            />
            {formState.errors.title?.message ? (
               <p className="text-sm text-destructive mt-1">{String(formState.errors.title.message)}</p>
            ) : null}
         </div>

         <div className="flex flex-col gap-3 mb-6">
            <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Leírás</Label>
            <Controller
               name="description"
               control={control}
               render={({ field }) => (
                  <Textarea {...field} value={field.value ?? ""} placeholder="További leírás hozzáadása..." className="resize-none h-32 bg-muted/30" />
               )}
            />
         </div>
      </>
   );
}
