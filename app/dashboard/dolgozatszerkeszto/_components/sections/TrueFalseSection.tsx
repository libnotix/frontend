"use client";

import { Circle } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";

export function TrueFalseSection() {
   const { control, formState } = useFormContext();

   return (
      <div className="mb-8">
         <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4 block">Válaszlehetőségek</Label>

         {formState.errors.correctAnswer?.message ? (
            <p className="text-sm text-destructive mb-2">{String(formState.errors.correctAnswer.message)}</p>
         ) : null}

         <Controller
            name="correctAnswer"
            control={control}
            render={({ field }) => (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                     type="button"
                     onPointerDown={(e) => e.stopPropagation()}
                     onClick={() => field.onChange("igaz")}
                     className={`border rounded-lg p-3 flex items-center gap-3 text-left transition-colors ${
                        field.value === "igaz" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground"
                     }`}
                  >
                     <Circle className={`h-5 w-5 shrink-0 ${field.value === "igaz" ? "text-primary" : "text-muted-foreground"}`} />
                     <span>Igaz (helyes)</span>
                  </button>
                  <button
                     type="button"
                     onPointerDown={(e) => e.stopPropagation()}
                     onClick={() => field.onChange("hamis")}
                     className={`border rounded-lg p-3 flex items-center gap-3 text-left transition-colors ${
                        field.value === "hamis" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground"
                     }`}
                  >
                     <Circle className={`h-5 w-5 shrink-0 ${field.value === "hamis" ? "text-primary" : "text-muted-foreground"}`} />
                     <span>Hamis (helyes)</span>
                  </button>
               </div>
            )}
         />
      </div>
   );
}
