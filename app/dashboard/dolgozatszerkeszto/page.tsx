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

export function SortableItem({ id, typeId, index, isActive = true }: { id: string; typeId: string; index: number; isActive?: boolean }) {
   const { ref, handleRef, isDragging } = useSortable({
      id: id,
      index: index,
   });

   return (
      <div 
         ref={ref} 
         className={`w-full pb-6 cursor-default ${isDragging ? "opacity-50" : ""}`}
      >
         <div className={`bg-card text-card-foreground p-6 w-full rounded-xl border-2 relative shadow-sm transition-colors ${isActive ? "border-primary" : "border-border"}`}>
            
            {/* Question Number Badge */}
            <div className="absolute -left-3 top-8 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
               {index + 1}
            </div>

            {isActive ? (
               <>
                  {/* Drag Handle & Type Display */}
                  <div className="flex items-center justify-between mb-4">
                     <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center">
                        QUESTION TITLE
                     </div>
                  </div>

                  {/* Question Title Input */}
                  <div className="mb-6">
                     <Input 
                        className="text-lg font-semibold py-6 border-none shadow-none focus-visible:ring-0 px-0 bg-transparent" 
                        placeholder="Identify the function of Mitochondria in a cell."
                        defaultValue="Identify the function of Mitochondria in a cell."
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     {/* Question Description */}
                     <div>
                        <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-2 block">
                           QUESTION DESCRIPTION
                        </Label>
                        <Textarea 
                           placeholder="Enter additional context for the question..." 
                           className="resize-none h-32 bg-muted/30"
                        />
                     </div>

                     {/* Visual Aid */}
                     <div>
                        <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-2 block">
                           VISUAL AID
                        </Label>
                        <div className="border-2 border-dashed border-border rounded-lg h-32 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 cursor-pointer hover:bg-muted/30 transition-colors">
                           <ImageIcon className="h-6 w-6 mb-2" />
                           <span className="text-xs font-medium">Upload Image</span>
                        </div>
                     </div>
                  </div>

                  {/* Grading Instructions */}
                  <div className="mb-6">
                     <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                           GRADING INSTRUCTIONS &amp; CORRECT ANSWER KEY
                        </Label>
                        <div className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                           <span className="text-blue-500">✨</span> AI Context
                        </div>
                     </div>
                     <Textarea 
                        placeholder="Provide guidance for AI or manual graders..." 
                        className="resize-none h-20 bg-muted/30"
                     />
                  </div>

                  {/* Answer Options */}
                  <div className="mb-8">
                     <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4 block">
                        ANSWER OPTIONS
                     </Label>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Correct Option */}
                        <div className="border-2 border-green-500 bg-green-50/50 rounded-lg p-3 flex items-center gap-3 relative group">
                           <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                           <Input 
                              className="border-none shadow-none bg-transparent font-medium px-0 h-auto focus-visible:ring-0" 
                              defaultValue="Produces ATP through cellular respiration" 
                           />
                           <Button variant="ghost" size="icon" className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                           </Button>
                        </div>

                        {/* Incorrect Option */}
                        <div className="border border-border rounded-lg p-3 flex items-center gap-3 relative group hover:border-muted-foreground transition-colors">
                           <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                           <Input 
                              className="border-none shadow-none bg-transparent font-medium px-0 h-auto focus-visible:ring-0" 
                              defaultValue="Synthesizes protein for the cell" 
                           />
                           <Button variant="ghost" size="icon" className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                           </Button>
                        </div>

                        {/* Incorrect Option */}
                        <div className="border border-border rounded-lg p-3 flex items-center gap-3 relative group hover:border-muted-foreground transition-colors">
                           <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                           <Input 
                              className="border-none shadow-none bg-transparent font-medium px-0 h-auto focus-visible:ring-0" 
                              defaultValue="Stores genetic information" 
                           />
                           <Button variant="ghost" size="icon" className="h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                           </Button>
                        </div>

                        {/* Add Option Button */}
                        <button className="border-2 border-dashed border-border rounded-lg p-3 flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors font-medium text-sm">
                           <Plus className="h-4 w-4" /> Add another option
                        </button>
                     </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                     <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                           <Label className="text-sm font-semibold text-muted-foreground">Points</Label>
                           <Input className="w-16 h-8 text-center font-bold bg-muted/30" defaultValue="5" />
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-4 bg-muted rounded-full relative cursor-pointer">
                              <div className="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                           </div>
                           <Label className="text-sm font-semibold text-muted-foreground">Required</Label>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-2">
                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-semibold gap-2">
                           <Copy className="h-4 w-4" /> Duplicate
                        </Button>
                        <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 font-semibold gap-2">
                           <Trash2 className="h-4 w-4" /> Remove
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
            
            {/* Drag Handle specific overlay to prevent drag interference on inputs */}
            <div 
               ref={handleRef}
               className="absolute top-0 right-0 w-8 h-8 cursor-grab flex items-center justify-center"
               title="Drag to reorder"
            >
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
               <CardContent className="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto bg-stone-50/50">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                           <span>Tanári felület</span>
                           <span>/</span>
                           <span>Feladatok</span>
                           <span>/</span>
                           <span>Biológia</span>
                           <span>/</span>
                           <span className="text-foreground">Új Biológia Dolgozat</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight">Új Biológia Dolgozat</h1>
                        <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2 font-medium">
                           <Cloud className="w-4 h-4" /> Piszkozat mentve: 10:45
                        </p>
                     </div>
                     <Button variant="outline" className="font-semibold gap-2 border-2 py-5 px-6 rounded-xl hover:bg-muted/50">
                        <Share2 className="w-4 h-4" /> Együttműködés
                     </Button>
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
                                 <SortableItem id={item.id} typeId={item.typeId} index={index} isActive={index === leftItems.length - 1} />
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
                                 <p className="text-sm text-muted-foreground mt-1">Kattints vagy húzz be egy típust a jobb oldalsávról</p>
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
