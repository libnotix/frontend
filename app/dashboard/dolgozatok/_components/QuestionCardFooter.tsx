"use client";

import { Trash2 } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type QuestionCardFooterProps = {
   onDelete?: () => void;
};

export function QuestionCardFooter({ onDelete }: QuestionCardFooterProps) {
   const { control } = useFormContext();

   return (
      <div className="flex items-center justify-between pt-4 border-t border-border">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <Label className="text-sm font-semibold text-muted-foreground">Kérdés pontszáma</Label>
               <Controller
                  name="points"
                  control={control}
                  render={({ field, fieldState }) => (
                     <div className="flex flex-col items-start">
                        <Input
                           {...field}
                           value={field.value === undefined || field.value === null ? "" : String(field.value)}
                           type="text"
                           inputMode="numeric"
                           className="w-16 h-8 text-center font-bold bg-muted/30"
                           placeholder="1-100"
                           onPointerDown={(e) => e.stopPropagation()}
                           onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "");
                              field.onChange(raw === "" ? undefined : Number(raw));
                           }}
                        />
                        {fieldState.error?.message ? (
                           <span className="text-xs text-destructive mt-0.5">{fieldState.error.message}</span>
                        ) : null}
                     </div>
                  )}
               />
            </div>
         </div>

         <div className="flex items-center gap-2">
            <Button
               type="button"
               variant="ghost"
               className="text-red-500 hover:text-red-600 hover:bg-red-50 font-semibold gap-2"
               onPointerDown={(e) => e.stopPropagation()}
               onClick={(e) => {
                  e.preventDefault();
                  onDelete?.();
               }}
            >
               <Trash2 className="h-4 w-4" /> Törlés
            </Button>
         </div>
      </div>
   );
}
