"use client";

import { Controller, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { DiffLeaf } from "./aiEdit/diffPrimitives";

export function QuestionCardFooter() {
   const { control } = useFormContext();

   return (
      <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-3">
         <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pontszám</span>

         <Controller
            name="points"
            control={control}
            render={({ field, fieldState }) => (
               <div className="flex flex-col items-end">
                  <DiffLeaf path="points" previewMode="merged" className="w-fit shrink-0">
                     <div
                        className={cn(
                           "flex h-8 items-center gap-1 rounded-full border bg-muted/60 pl-3 pr-3 transition-colors focus-within:bg-muted",
                           fieldState.error ? "border-destructive/50" : "border-border/60 focus-within:border-primary/60",
                        )}
                     >
                        <input
                           {...field}
                           value={field.value === undefined || field.value === null ? "" : String(field.value)}
                           type="text"
                           inputMode="numeric"
                           aria-label="Pontszám"
                           className="w-9 border-0 bg-transparent p-0 text-center text-sm font-semibold tabular-nums outline-none placeholder:text-muted-foreground/60"
                           placeholder="5"
                           onPointerDown={(event) => event.stopPropagation()}
                           onChange={(event) => {
                              const raw = event.target.value.replace(/\D/g, "");
                              field.onChange(raw === "" ? undefined : Number(raw));
                           }}
                        />
                        <span className="text-[11px] font-medium text-muted-foreground">pont</span>
                     </div>
                  </DiffLeaf>
                  {fieldState.error?.message ? (
                     <span className="mt-1 text-[11px] text-destructive">{fieldState.error.message}</span>
                  ) : null}
               </div>
            )}
         />
      </div>
   );
}
