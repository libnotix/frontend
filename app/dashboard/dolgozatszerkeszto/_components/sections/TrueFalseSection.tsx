"use client";

import { Circle } from "lucide-react";
import { Label } from "@/components/ui/label";

export function TrueFalseSection() {
   return (
      <div className="mb-8">
         <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4 block">Válaszlehetőségek</Label>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-3 flex items-center gap-3 relative group hover:border-muted-foreground transition-colors">
               <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
               <span>Igaz</span>
            </div>
            <div className="border border-border rounded-lg p-3 flex items-center gap-3 relative group hover:border-muted-foreground transition-colors">
               <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
               <span>Hamis</span>
            </div>
         </div>
      </div>
   );
}
