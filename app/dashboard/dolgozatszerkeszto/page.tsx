"use client";

import React, { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDraggable, useDroppable, DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Trash2, Image as ImageIcon, Plus, CheckCircle2, Circle, Cloud, Share2 } from "lucide-react";

export function Draggable({ id, typeId }: { id: string; typeId: string }) {
   const { ref } = useDraggable({
      id: id,
   });

   return (
      <button
         ref={ref}
         className="bg-primary text-primary-foreground px-6 py-3 mb-4 w-full h-15 font-semibold cursor-grab active:cursor-grabbing shadow-lg hover:bg-primary/90 transition-colors"
      >
         {available_items.find((item) => item.id === typeId)?.text}
      </button>
   );
}

export function SortableItem({
   id,
   typeId,
   index,
   isActive = true,
   onDelete,
}: {
   id: string;
   typeId: string;
   index: number;
   isActive?: boolean;
   onDelete?: () => void;
}) {
   const { ref, handleRef, isDragging } = useSortable({
      id: id,
      index: index,
   });

   const [options, setOptions] = useState([
      { id: 1, value: "Teszt 1" },
      { id: 2, value: "Teszt 2" },
      { id: 3, value: "Teszt 3" },
      { id: 4, value: "Teszt 4" },
   ]);

   const addOption = () => {
      setOptions([...options, { id: Date.now(), value: `Teszt ${options.length + 1}` }]);
   };

   const removeOption = (idToRemove: number) => {
      setOptions(options.filter((opt) => opt.id !== idToRemove));
   };

   const [premises, setPremises] = useState([
      { id: 1, value: "1. Kifejezés", correctResponses: [] as number[] },
      { id: 2, value: "2. Kifejezés", correctResponses: [] as number[] },
      { id: 3, value: "3. Kifejezés", correctResponses: [] as number[] },
   ]);

   const addPremise = () => {
      setPremises([...premises, { id: Date.now(), value: `${premises.length + 1}. Kifejezés`, correctResponses: [] as number[] }]);
   };

   const removePremise = (idToRemove: number) => {
      setPremises(premises.filter((item) => item.id !== idToRemove));
   };

   const [responses, setResponses] = useState([
      { id: 1, value: "A. Magyarázat" },
      { id: 2, value: "B. Magyarázat" },
      { id: 3, value: "C. Magyarázat" },
   ]);

   const addResponse = () => {
      setResponses([...responses, { id: Date.now(), value: `${String.fromCharCode(65 + responses.length)}. Magyarázat` }]);
   };

   const removeResponse = (idToRemove: number) => {
      setResponses(responses.filter((item) => item.id !== idToRemove));
   };

   return (
      <div ref={ref} className={`w-full pb-6 cursor-default ${isDragging ? "opacity-50" : ""}`}>
         <div
            className={`bg-card text-card-foreground p-6 w-full rounded-xl border-2 relative shadow-sm transition-colors ${isActive ? "border-primary" : "border-border"}`}
         >
            <div className="absolute -left-3 top-8 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
               {index + 1}
            </div>

            {isActive ? (
               <>
                  <div className="flex items-center justify-between">
                     <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center">Kérdés</div>
                  </div>
                  <div className="mb-6">
                     <Input
                        className="text-lg font-semibold py-6 border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
                        placeholder="Kattintson ide, majd adja meg a feladat címét"
                     />
                  </div>

                  <div className="flex flex-col gap-3 mb-6">
                     <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Leírás</Label>
                     <Textarea placeholder="További leírás hozzáadása..." className="resize-none h-32 bg-muted/30" />
                  </div>

                  {typeId === "item-1" && (
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
                                    onChange={(e) => {
                                       setOptions(options.map((opt) => (opt.id === option.id ? { ...opt, value: e.target.value } : opt)));
                                    }}
                                 />
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeOption(option.id)}
                                 >
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                 </Button>
                              </div>
                           ))}

                           {/* Add Option Button */}
                           <button
                              onClick={addOption}
                              className="border-2 border-dashed border-border rounded-lg p-3 flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors font-medium text-sm"
                           >
                              <Plus className="h-4 w-4" /> Válaszlehetőség hozzáadása
                           </button>
                        </div>
                     </div>
                  )}

                  {typeId === "item-2" && (
                     <div className="mb-8">
                        <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4 block">Válaszlehetőségek</Label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="border border-border rounded-lg p-3 flex items-center gap-3 relative group hover:border-muted-foreground transition-colors">
                              <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                              <span>Igaz</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                           </div>
                           <div className="border border-border rounded-lg p-3 flex items-center gap-3 relative group hover:border-muted-foreground transition-colors">
                              <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                              <span>Hamis</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                           </div>
                        </div>
                     </div>
                  )}

                  {typeId === "item-3" && (
                     <div className="mb-8">
                        <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4 block">Válasz</Label>

                        <div className="flex flex-col gap-3 mb-6">
                           <Textarea placeholder="Válasz hozzáadása..." className="resize-none h-32 bg-muted/30" />
                        </div>
                     </div>
                  )}

                  {typeId === "item-4" && (
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
                                                const isSelected = (item.correctResponses || []).includes(resp.id);
                                                return (
                                                   <button
                                                      key={resp.id}
                                                      onClick={() => {
                                                         const current = item.correctResponses || [];
                                                         const next = isSelected ? current.filter((id) => id !== resp.id) : [...current, resp.id];
                                                         setPremises(premises.map((p) => (p.id === item.id ? { ...p, correctResponses: next } : p)));
                                                      }}
                                                      className={`h-6 w-6 rounded text-xs font-bold transition-all flex items-center justify-center ${
                                                         isSelected ? "bg-primary text-primary-foreground shadow-sm scale-105" : "text-muted-foreground/60 hover:bg-muted-foreground/10 hover:text-muted-foreground"
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
                                          onChange={(e) => setPremises(premises.map((p) => p.id === item.id ? { ...p, value: e.target.value } : p))}
                                       />
                                       <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => removePremise(item.id)}
                                       >
                                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                                       </Button>
                                    </div>
                                 </div>
                              ))}
                              <button
                                 onClick={addPremise}
                                 className="border-2 border-dashed border-border rounded-lg p-3 flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors font-medium text-sm mt-3 w-full"
                              >
                                 <Plus className="h-4 w-4" /> Új Kifejezés
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
                                          onChange={(e) => setResponses(responses.map((p) => p.id === item.id ? { ...p, value: e.target.value } : p))}
                                       />
                                       <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => removeResponse(item.id)}
                                       >
                                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                                       </Button>
                                    </div>
                                 </div>
                              ))}
                              <button
                                 onClick={addResponse}
                                 className="border-2 border-dashed border-border rounded-lg p-3 flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors font-medium text-sm mt-3 w-full"
                              >
                                 <Plus className="h-4 w-4" /> Új Válasz
                              </button>
                           </div>
                        </div>
                     </div>
                  )}

                  {typeId === "item-5" && (
                     <div className="mb-8">
                        <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4 block">Válasz</Label>

                        <div className="flex flex-col gap-3 mb-6">
                           <Textarea placeholder="Válasz hozzáadása..." className="resize-none h-32 bg-muted/30" />
                        </div>
                     </div>
                  )}

                  {/* Footer */}
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
               </>
            ) : (
               <div className="flex items-center justify-between pl-6 py-2">
                  <div>
                     <h3 className="text-lg font-bold">Cell Structure Basics</h3>
                     <p className="text-sm text-muted-foreground font-medium mt-1">
                        {available_items.find((item) => item.id === typeId)?.text || "Multiple Choice"} • 5 Points
                     </p>
                  </div>
               </div>
            )}

            <div ref={handleRef} className="absolute top-0 right-0 w-8 h-8 cursor-grab flex items-center justify-center" title="Drag to reorder">
               <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
               </div>
            </div>
         </div>
      </div>
   );
}

export function Droppable({ children, id }: { children?: React.ReactNode; id?: string }) {
   const { isDropTarget, ref } = useDroppable({ id: id ?? "droppable" });

   return (
      <div
         ref={ref}
         className={`w-full h-full flex flex-col items-center justify-start p-2 rounded-md transition-colors ${isDropTarget ? "bg-black/5 dark:bg-white/10" : ""}`}
      >
         {children}
      </div>
   );
}

const available_items = [
   { id: "item-1", text: "Feleletválasztós" },
   { id: "item-2", text: "Igaz/Hamis" },
   { id: "item-3", text: "Rövid válasz" },
   { id: "item-4", text: "Párosítás" },
   { id: "item-5", text: "Hosszú válasz" },
];

type LeftItem = { id: string; typeId: string };

const DolgozatSzerkeszto = () => {
   const [leftItems, setLeftItems] = useState<LeftItem[]>([]);
   const [activeDragId, setActiveDragId] = useState<string | null>(null);
   const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);

   return (
      <DragDropProvider
         onDragStart={(e) => setActiveDragId(e.operation.source?.id as string)}
         onDragOver={(e) => setHoveredTargetId((e.operation.target?.id as string) ?? null)}
         onDragEnd={(event) => {
            setActiveDragId(null);
            setHoveredTargetId(null);

            if (event.canceled) return;
            const targetId = event.operation.target?.id as string;
            const sourceId = event.operation.source?.id as string;
            if (targetId && sourceId) {
               const isTargetCanvasItem = targetId !== "droppable-1" && targetId !== "droppable-2" && !targetId.startsWith("palette-");
               const isTargetPaletteItem = targetId === "droppable-2" || targetId.startsWith("palette-");

               if (sourceId.startsWith("palette-") && (targetId === "droppable-1" || isTargetCanvasItem)) {
                  const typeId = sourceId.replace("palette-", "");
                  const newItem = { id: `${typeId}-${Date.now()}`, typeId };

                  setLeftItems((prev) => {
                     if (isTargetCanvasItem) {
                        const targetIndex = prev.findIndex((i) => i.id === targetId);
                        if (targetIndex !== -1) {
                           const newItems = [...prev];
                           newItems.splice(targetIndex, 0, newItem);
                           return newItems;
                        }
                     }
                     return [...prev, newItem];
                  });
               } else if (!sourceId.startsWith("palette-") && isTargetPaletteItem) {
                  setLeftItems((prev) => prev.filter((item) => item.id !== sourceId));
               } else if (!sourceId.startsWith("palette-") && isTargetCanvasItem) {
                  setLeftItems((prev) => {
                     const oldIndex = prev.findIndex((i) => i.id === sourceId);
                     const newIndex = prev.findIndex((i) => i.id === targetId);
                     if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev;

                     const newItems = [...prev];
                     const [moved] = newItems.splice(oldIndex, 1);
                     newItems.splice(newIndex, 0, moved);
                     return newItems;
                  });
               } else if (!sourceId.startsWith("palette-") && targetId === "droppable-1") {
                  setLeftItems((prev) => {
                     const oldIndex = prev.findIndex((i) => i.id === sourceId);
                     if (oldIndex < 0) return prev;
                     const newItems = [...prev];
                     const [moved] = newItems.splice(oldIndex, 1);
                     newItems.push(moved);
                     return newItems;
                  });
               }
            }
         }}
      >
         <div className="h-[calc(100vh-4rem)] w-full p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8 overflow-hidden">
            <Card className="flex-1 w-full border-2 flex flex-col min-h-0">
               <CardContent className="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto">
                  <div className="flex items-center justify-between mb-8">
                     <Input
                        className="font-semibold py-6 pl-2 border-none shadow-none px-0 focus-visible:ring-0 bg-transparent w-full text-center"
                        placeholder="Új Dolgozat"
                        style={{ fontSize: "24px" }}
                     />
                  </div>

                  <div className="border-2 border-none flex-1 relative rounded-md">
                     {leftItems.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center p-4 text-muted-foreground text-lg z-0">Húzd ide a feladatot...</div>
                     )}
                     <Droppable id="droppable-1">
                        <div className="space-y-4 w-full z-10 relative">
                           {leftItems.map((item, index) => (
                              <div key={item.id} className="relative w-full">
                                 {activeDragId?.startsWith("palette-") && hoveredTargetId === item.id && (
                                    <div className="absolute -top-2 translate-y-[-50%] left-0 right-0 h-1.5 bg-primary shadow border border-primary/50 rounded-full pointer-events-none z-10" />
                                 )}
                                 <SortableItem
                                    id={item.id}
                                    typeId={item.typeId}
                                    index={index}
                                    onDelete={() => setLeftItems((prev) => prev.filter((i) => i.id !== item.id))}
                                 />
                              </div>
                           ))}
                           {activeDragId?.startsWith("palette-") && hoveredTargetId === "droppable-1" && leftItems.length > 0 && (
                              <div className="w-full h-1.5 bg-primary shadow border border-primary/50 rounded-full pointer-events-none transition-all" />
                           )}

                           {leftItems.length > 0 && (
                              <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-card hover:bg-muted/30 transition-colors cursor-pointer mt-8">
                                 <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-sm">
                                    <Plus className="w-6 h-6" />
                                 </div>
                                 <h3 className="text-base font-bold">Új kérdés hozzáadása</h3>
                                 <p className="text-sm text-muted-foreground mt-1">Húzz be egy újabb kérdést a hozzáadáshoz</p>
                              </div>
                           )}
                        </div>
                     </Droppable>
                  </div>
               </CardContent>
            </Card>
            <Card className="flex-1 md:flex-none w-full md:w-96 md:max-w-sm border-2 flex flex-col min-h-0 shrink-0">
               <CardContent className="flex-1 flex flex-col pt-6">
                  <p className="text-2xl font-semibold">Feladattípusok</p>
                  <p className="mt-2 mb-4">Húzd balra a feladat hozzáadásához</p>
                  <div className="flex-1 min-h-0 relative">
                     <Droppable id="droppable-2">
                        {available_items.map((item) => (
                           <Draggable key={`palette-${item.id}`} id={`palette-${item.id}`} typeId={item.id} />
                        ))}
                     </Droppable>
                  </div>
               </CardContent>
            </Card>
         </div>
      </DragDropProvider>
   );
};

export default memo(DolgozatSzerkeszto);
