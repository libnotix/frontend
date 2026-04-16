"use client";

import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DragDropProvider } from "@dnd-kit/react";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { AVAILABLE_TASK_TYPES } from "./constants";
import { CanvasDroppable } from "./CanvasDroppable";
import { PaletteDraggable } from "./PaletteDraggable";
import { SortableQuestionItem } from "./SortableQuestionItem";
import type { CanvasItem } from "./types";

function DolgozatEditorInner() {
   const [leftItems, setLeftItems] = useState<CanvasItem[]>([]);
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
                        <CanvasDroppable id="droppable-1">
                           <div className="absolute inset-0 flex items-center justify-center p-4 text-muted-foreground text-lg z-0">
                              Húzd ide a feladatot...
                           </div>
                        </CanvasDroppable>
                     )}

                     <div className="space-y-4 w-full z-10 relative flex flex-col">
                        {leftItems.map((item, index) => (
                           <div key={item.id} className="relative w-full">
                              {activeDragId?.startsWith("palette-") && hoveredTargetId === item.id && (
                                 <div className="absolute -top-2 translate-y-[-50%] left-0 right-0 h-1.5 bg-primary shadow border border-primary/50 rounded-full pointer-events-none z-10" />
                              )}
                              <SortableQuestionItem
                                 id={item.id}
                                 typeId={item.typeId}
                                 index={index}
                                 onDelete={() => setLeftItems((prev) => prev.filter((i) => i.id !== item.id))}
                              />
                           </div>
                        ))}

                        {leftItems.length > 0 && (
                           <CanvasDroppable id="droppable-1">
                              <div className="relative border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-card hover:bg-muted/30 transition-colors cursor-pointer mt-8 w-full min-h-[150px]">
                                 {activeDragId?.startsWith("palette-") && hoveredTargetId === "droppable-1" && (
                                    <div className="absolute -top-1 left-0 right-0 h-1.5 bg-primary shadow border border-primary/50 rounded-full pointer-events-none transition-all" />
                                 )}
                                 <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-sm">
                                    <Plus className="w-6 h-6" />
                                 </div>
                                 <h3 className="text-base font-bold">Új kérdés hozzáadása</h3>
                                 <p className="text-sm text-muted-foreground mt-1">Húzz be egy újabb kérdést a hozzáadáshoz</p>
                              </div>
                           </CanvasDroppable>
                        )}
                     </div>
                  </div>
               </CardContent>
            </Card>
            <Card className="flex-1 md:flex-none w-full md:w-96 md:max-w-sm border-2 flex flex-col min-h-0 shrink-0">
               <CardContent className="flex-1 flex flex-col pt-6">
                  <p className="text-2xl font-semibold">Feladattípusok</p>
                  <p className="mt-2 mb-4">Húzd balra a feladat hozzáadásához</p>
                  <div className="flex-1 min-h-0 relative">
                     <CanvasDroppable id="droppable-2">
                        {AVAILABLE_TASK_TYPES.map((item) => (
                           <PaletteDraggable key={`palette-${item.id}`} id={`palette-${item.id}`} typeId={item.id} />
                        ))}
                     </CanvasDroppable>
                  </div>
               </CardContent>
            </Card>
         </div>
      </DragDropProvider>
   );
}

export const DolgozatEditor = memo(DolgozatEditorInner);
