"use client";

import { Circle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ChoiceOption } from "../types";

type MultipleChoiceSectionProps = {
   options: ChoiceOption[];
   onChangeOption: (id: number, value: string) => void;
   onRemoveOption: (id: number) => void;
   onAddOption: () => void;
};

export function MultipleChoiceSection({ options, onChangeOption, onRemoveOption, onAddOption }: MultipleChoiceSectionProps) {
   return (
      <div className="mb-8">
         <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4 block">Válaszlehetőségek</Label>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option) => (
               <div
                  key={option.id}
                  className="border border-border rounded-lg p-3 flex items-center gap-3 relative group hover:border-muted-foreground transition-colors"
               >
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  <Input
                     className="border-none shadow-none bg-transparent font-medium px-0 h-auto focus-visible:ring-0"
                     value={option.value}
                     onChange={(e) => onChangeOption(option.id, e.target.value)}
                  />
                  <Button
                     variant="ghost"
                     size="icon"
                     className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                     onClick={() => onRemoveOption(option.id)}
                  >
                     <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
               </div>
            ))}
            <button
               type="button"
               onClick={onAddOption}
               className="border-2 border-dashed border-border rounded-lg p-3 flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors font-medium text-sm"
            >
               <Plus className="h-4 w-4" /> Válaszlehetőség hozzáadása
            </button>
         </div>
      </div>
   );
}
