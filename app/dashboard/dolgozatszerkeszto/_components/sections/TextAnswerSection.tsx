"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TextAnswerSectionProps = {
   label?: string;
   placeholder?: string;
   /** Long-answer copy hints stricter validation via schema; UI copy only here. */
   helper?: string;
};

export function TextAnswerSection({
   label = "Válasz / útmutató",
   placeholder = "Válasz vagy értékelési útmutató...",
   helper,
}: TextAnswerSectionProps) {
   const { control } = useFormContext();

   return (
      <div className="mb-8">
         <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4 block">{label}</Label>
         {helper ? <p className="text-sm text-muted-foreground mb-2">{helper}</p> : null}

         <Controller
            name="rubric"
            control={control}
            render={({ field, fieldState }) => (
               <>
                  <Textarea
                     {...field}
                     value={field.value ?? ""}
                     placeholder={placeholder}
                     className="resize-none h-32 bg-muted/30"
                     onPointerDown={(e) => e.stopPropagation()}
                  />
                  {fieldState.error?.message ? <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p> : null}
               </>
            )}
         />
      </div>
   );
}
