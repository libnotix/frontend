"use client";

import { Circle } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { SectionHeader } from "../SectionHeader";
import { DiffLeaf } from "../aiEdit/diffPrimitives";

export function TrueFalseSection() {
   const { control, formState } = useFormContext();
   const error =
      typeof formState.errors.correctAnswer?.message === "string"
         ? formState.errors.correctAnswer.message
         : undefined;

   return (
      <div className="mb-5">
         <SectionHeader
            label="Helyes válasz"
            helper="Jelöld meg, hogy az állítás igaz vagy hamis."
            error={error}
         />

         <Controller
            name="correctAnswer"
            control={control}
            render={({ field }) => (
               <DiffLeaf path="correctAnswer" previewMode="merged">
               <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <button
                     type="button"
                     onPointerDown={(e) => e.stopPropagation()}
                     onClick={() => field.onChange("igaz")}
                     className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                        field.value === "igaz"
                           ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                           : "border-border/70 hover:border-muted-foreground/60 hover:bg-muted/20",
                     )}
                  >
                     <Circle
                        className={cn(
                           "h-5 w-5 shrink-0",
                           field.value === "igaz" ? "fill-primary text-primary" : "text-muted-foreground",
                        )}
                     />
                     <span className="font-medium">Igaz</span>
                  </button>
                  <button
                     type="button"
                     onPointerDown={(e) => e.stopPropagation()}
                     onClick={() => field.onChange("hamis")}
                     className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                        field.value === "hamis"
                           ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                           : "border-border/70 hover:border-muted-foreground/60 hover:bg-muted/20",
                     )}
                  >
                     <Circle
                        className={cn(
                           "h-5 w-5 shrink-0",
                           field.value === "hamis" ? "fill-primary text-primary" : "text-muted-foreground",
                        )}
                     />
                     <span className="font-medium">Hamis</span>
                  </button>
               </div>
               </DiffLeaf>
            )}
         />
      </div>
   );
}
