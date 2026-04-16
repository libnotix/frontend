"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type QuestionCardFooterProps = {
   onDelete?: () => void;
};

export function QuestionCardFooter({ onDelete }: QuestionCardFooterProps) {
   return (
      <div className="flex items-center justify-between pt-4 border-t border-border">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <Label className="text-sm font-semibold text-muted-foreground">Kérdés pontszáma</Label>
               <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[1-9]*"
                  className="w-16 h-8 text-center font-bold bg-muted/30"
                  defaultValue="5"
                  placeholder="1-100"
                  onChange={(e) => {
                     e.target.value = e.target.value.replace(/[^1-9]/g, "");
                  }}
               />
            </div>
         </div>

         <div className="flex items-center gap-2">
            <Button onClick={onDelete} variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 font-semibold gap-2">
               <Trash2 className="h-4 w-4" /> Törlés
            </Button>
         </div>
      </div>
   );
}
