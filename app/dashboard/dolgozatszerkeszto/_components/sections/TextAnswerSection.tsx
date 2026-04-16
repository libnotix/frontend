"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TextAnswerSectionProps = {
   label?: string;
   placeholder?: string;
};

export function TextAnswerSection({
   label = "Válasz",
   placeholder = "Válasz hozzáadása...",
}: TextAnswerSectionProps) {
   return (
      <div className="mb-8">
         <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4 block">{label}</Label>

         <div className="flex flex-col gap-3 mb-6">
            <Textarea placeholder={placeholder} className="resize-none h-32 bg-muted/30" />
         </div>
      </div>
   );
}
