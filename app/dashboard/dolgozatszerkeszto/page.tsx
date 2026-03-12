"use client";

import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDraggable, useDroppable, DragDropProvider } from "@dnd-kit/react";

export function Draggable() {
   const { ref } = useDraggable({
      id: "draggable",
   });

   return (
      <button
         ref={ref}
         className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold cursor-grab active:cursor-grabbing shadow-lg hover:bg-primary/90 transition-colors"
      >
         Draggable Item
      </button>
   );
}

export function Droppable({ children, id }: { children?: React.ReactNode; id?: string }) {
   const { isDropTarget, ref } = useDroppable({ id: id ?? "droppable" });

   return (
      <div ref={ref} className={`w-full h-full flex items-center justify-center ${isDropTarget ? "bg-white/20" : ""}`}>
         {children}
      </div>
   );
}

const DolgozatSzerkeszto = () => {
   const [parent, setParent] = useState<string>("droppable-1");

   return (
      <DragDropProvider
         onDragEnd={(event) => {
            if (event.canceled) return;
            if (event.operation.target?.id) {
               setParent(event.operation.target.id as string);
            }
         }}
      >
         <div className="flex flex-row gap-20 mt-10 justify-center flex-wrap">
            <Card className="w-full h-80 max-w-md m-2 border-2 border-slate-700/50 bg-slate-900/40">
               <CardContent className="h-full p-2">
                  <Droppable id="droppable-1">{parent === "droppable-1" ? <Draggable /> : null}</Droppable>
               </CardContent>
            </Card>
            <Card className="w-full h-80 max-w-md m-2 border-2 border-slate-700/50 bg-slate-900/40">
               <CardContent className="h-full p-2">
                  <Droppable id="droppable-2">{parent === "droppable-2" ? <Draggable /> : null}</Droppable>
               </CardContent>
            </Card>
         </div>
      </DragDropProvider>
   );
};

export default memo(DolgozatSzerkeszto);
