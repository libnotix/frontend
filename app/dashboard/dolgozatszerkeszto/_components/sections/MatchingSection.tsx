"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MatchingPremise, MatchingResponse } from "../types";

type MatchingSectionProps = {
   premises: MatchingPremise[];
   responses: MatchingResponse[];
   onChangePremiseValue: (id: number, value: string) => void;
   onRemovePremise: (id: number) => void;
   onAddPremise: () => void;
   onChangeResponseValue: (id: number, value: string) => void;
   onRemoveResponse: (id: number) => void;
   onAddResponse: () => void;
   onToggleCorrectResponse: (premiseId: number, responseId: number) => void;
};

export function MatchingSection({
   premises,
   responses,
   onChangePremiseValue,
   onRemovePremise,
   onAddPremise,
   onChangeResponseValue,
   onRemoveResponse,
   onAddResponse,
   onToggleCorrectResponse,
}: MatchingSectionProps) {
   return (
      <div className="mb-8">
         <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-6 block">Párosítási lehetőségek</Label>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-3">
               {premises.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 w-full group">
                     <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-muted-foreground w-4 text-right shrink-0">{index + 1}.</span>
                        <div className="grid grid-cols-2 bg-muted/40 rounded-md p-1 border border-border min-w-[40px] min-h-[34px] gap-1 shadow-inner">
                           {responses.length === 0 ? (
                              <span className="text-muted-foreground/50 text-[10px] uppercase font-bold flex items-center px-1">...</span>
                           ) : (
                              responses.map((resp, respIndex) => {
                                 const letter = String.fromCharCode(65 + respIndex);
                                 const isSelected = (item.correctResponses ?? []).includes(resp.id);
                                 return (
                                    <button
                                       key={resp.id}
                                       type="button"
                                       onClick={() => onToggleCorrectResponse(item.id, resp.id)}
                                       className={`h-6 w-6 rounded text-xs font-bold transition-all flex items-center justify-center ${
                                          isSelected
                                             ? "bg-primary text-primary-foreground shadow-sm scale-105"
                                             : "text-muted-foreground/60 hover:bg-muted-foreground/10 hover:text-muted-foreground"
                                       }`}
                                       title={resp.value}
                                    >
                                       {letter}
                                    </button>
                                 );
                              })
                           )}
                        </div>
                     </div>
                     <div className="flex-1 border border-border rounded-lg p-2.5 flex items-center bg-card hover:border-muted-foreground transition-colors relative">
                        <Input
                           className="border-none shadow-none bg-transparent font-medium px-2 h-auto focus-visible:ring-0"
                           value={item.value}
                           onChange={(e) => onChangePremiseValue(item.id, e.target.value)}
                        />
                        <Button
                           variant="ghost"
                           size="icon"
                           className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                           onClick={() => onRemovePremise(item.id)}
                        >
                           <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                     </div>
                  </div>
               ))}
               <button
                  type="button"
                  onClick={onAddPremise}
                  className="border-2 border-dashed border-border rounded-lg p-3 flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors font-medium text-sm mt-3 w-full"
               >
                  <Plus className="h-4 w-4" />{"\u00da"}j Kifejezés
               </button>
            </div>

            <div className="flex flex-col gap-3">
               {responses.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 w-full group">
                     <span className="font-bold text-muted-foreground w-8 text-right shrink-0">{String.fromCharCode(65 + index)}.</span>
                     <div className="flex-1 border border-border rounded-lg p-2.5 flex items-center bg-card hover:border-muted-foreground transition-colors relative">
                        <Input
                           className="border-none shadow-none bg-transparent font-medium px-2 h-auto focus-visible:ring-0"
                           value={item.value}
                           onChange={(e) => onChangeResponseValue(item.id, e.target.value)}
                        />
                        <Button
                           variant="ghost"
                           size="icon"
                           className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                           onClick={() => onRemoveResponse(item.id)}
                        >
                           <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                     </div>
                  </div>
               ))}
               <button
                  type="button"
                  onClick={onAddResponse}
                  className="border-2 border-dashed border-border rounded-lg p-3 flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors font-medium text-sm mt-3 w-full"
               >
                  <Plus className="h-4 w-4" />{"\u00da"}j Válasz
               </button>
            </div>
         </div>
      </div>
   );
}
