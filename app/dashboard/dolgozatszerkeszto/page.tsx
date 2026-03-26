"use client";

import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDraggable, useDroppable, DragDropProvider } from "@dnd-kit/react";

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

   return (
      <DragDropProvider
         onDragEnd={(event) => {
            if (event.canceled) return;
            const targetId = event.operation.target?.id;
            const sourceId = event.operation.source?.id as string;
            if (targetId && sourceId) {
               if (sourceId.startsWith("palette-") && targetId === "droppable-1") {
                  const typeId = sourceId.replace("palette-", "");
                  setLeftItems((prev) => [...prev, { id: `${typeId}-${Date.now()}`, typeId }]);
               } else if (!sourceId.startsWith("palette-") && targetId === "droppable-2") {
                  setLeftItems((prev) => prev.filter((item) => item.id !== sourceId));
               }
            }
         }}
      >
         <div className="h-[calc(100vh-4rem)] w-full p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8 overflow-hidden">
            <Card className="flex-1 w-full border-2 flex flex-col min-h-0">
               <CardContent className="flex-1 p-4 flex flex-col">
                  <h1 className="text-2xl font-semibold pb-2">Új dolgozat létrehozása</h1>
                  <div className="border-2 border-none flex-1 relative rounded-md">
                     {leftItems.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center p-4 text-muted-foreground text-lg">Húzd ide a feladatot...</div>
                     )}
                     <Droppable id="droppable-1">
                        {leftItems.map((item) => (
                           <Draggable key={item.id} id={item.id} typeId={item.typeId} />
                        ))}
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
