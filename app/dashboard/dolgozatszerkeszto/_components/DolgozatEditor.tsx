"use client";

import { memo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DragDropManager } from "@dnd-kit/dom";
import { Card, CardContent } from "@/components/ui/card";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortableOperation } from "@dnd-kit/react/sortable";
import { Plus } from "lucide-react";
import { AVAILABLE_TASK_TYPES, CANVAS_SORTABLE_GROUP } from "./constants";
import { isExamTaskTypeId } from "./examTaskTypes";
import { CanvasDroppable } from "./CanvasDroppable";
import { dedupeCanvasItemsById, mergeCanvasOrder, newCanvasItemId } from "./dnd/canvasItemsState";
import { getOrderedCanvasItemIds } from "./dnd/getOrderedCanvasItemIds";
import { DolgozatMetaFields } from "./form/DolgozatMetaFields";
import { dolgozatMetaSchema, type DolgozatMetaFormValues } from "./form/dolgozatMetaSchema";
import { PaletteDraggable } from "./PaletteDraggable";
import { SortableQuestionItem } from "./SortableQuestionItem";
import type { CanvasItem } from "./types";

function DolgozatEditorInner() {
   const metaForm = useForm<DolgozatMetaFormValues>({
      resolver: zodResolver(dolgozatMetaSchema),
      defaultValues: { title: "" },
      mode: "onBlur",
   });

   const [leftItems, setLeftItems] = useState<CanvasItem[]>([]);
   const [activeDragId, setActiveDragId] = useState<string | null>(null);
   const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);

   return (
      <FormProvider {...metaForm}>
         <DragDropProvider
            onDragStart={(e) => setActiveDragId(e.operation.source?.id != null ? String(e.operation.source.id) : null)}
            onDragOver={(e) => setHoveredTargetId(e.operation.target?.id != null ? String(e.operation.target.id) : null)}
            onDragEnd={(event, manager: DragDropManager) => {
               setActiveDragId(null);
               setHoveredTargetId(null);

               if (event.canceled) return;

               const sourceId = event.operation.source?.id != null ? String(event.operation.source.id) : "";
               const targetId = event.operation.target?.id != null ? String(event.operation.target.id) : "";
               if (!sourceId || !targetId) return;

               const isTargetCanvasItem = targetId !== "droppable-1" && targetId !== "droppable-2" && !targetId.startsWith("palette-");
               const isTargetPaletteItem = targetId === "droppable-2" || targetId.startsWith("palette-");

               if (sourceId.startsWith("palette-") && (targetId === "droppable-1" || isTargetCanvasItem)) {
                  const typeId = sourceId.replace("palette-", "");
                  if (!isExamTaskTypeId(typeId)) return;
                  const newItem: CanvasItem = { id: newCanvasItemId(typeId), typeId };

                  setLeftItems((prev) => {
                     const clean = dedupeCanvasItemsById(prev);
                     if (isTargetCanvasItem) {
                        const targetIndex = clean.findIndex((i) => i.id === targetId);
                        if (targetIndex !== -1) {
                           const newItems = [...clean];
                           newItems.splice(targetIndex, 0, newItem);
                           return newItems;
                        }
                     }
                     return [...clean, newItem];
                  });
                  return;
               }

               if (!sourceId.startsWith("palette-") && isTargetPaletteItem) {
                  setLeftItems((prev) => dedupeCanvasItemsById(prev.filter((item) => item.id !== sourceId)));
                  return;
               }

               if (isSortableOperation(event.operation)) {
                  setLeftItems((prev) => {
                     const orderedIds = getOrderedCanvasItemIds(manager, CANVAS_SORTABLE_GROUP);
                     return mergeCanvasOrder(prev, orderedIds);
                  });
                  return;
               }

               if (!sourceId.startsWith("palette-") && targetId === "droppable-1") {
                  setLeftItems((prev) => {
                     const clean = dedupeCanvasItemsById(prev);
                     const oldIndex = clean.findIndex((i) => i.id === sourceId);
                     if (oldIndex < 0) return clean;
                     const newItems = [...clean];
                     const [moved] = newItems.splice(oldIndex, 1);
                     newItems.push(moved);
                     return newItems;
                  });
               }
            }}
         >
            <div className="h-[calc(100vh-4rem)] w-full p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8 overflow-hidden">
               <Card className="flex-1 w-full border-2 flex flex-col min-h-0">
                  <CardContent className="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto">
                     <DolgozatMetaFields />

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
                              <SortableQuestionItem
                                 key={item.id}
                                 id={item.id}
                                 typeId={item.typeId}
                                 index={index}
                                 paletteInsertIndicator={
                                    activeDragId?.startsWith("palette-") && hoveredTargetId === item.id ? (
                                       <div className="absolute -top-2 translate-y-[-50%] left-0 right-0 h-1.5 bg-primary shadow border border-primary/50 rounded-full pointer-events-none z-10" />
                                    ) : null
                                 }
                                 onDelete={() =>
                                    setLeftItems((prev) => dedupeCanvasItemsById(prev.filter((i) => i.id !== item.id)))
                                 }
                              />
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
      </FormProvider>
   );
}

export const DolgozatEditor = memo(DolgozatEditorInner);
