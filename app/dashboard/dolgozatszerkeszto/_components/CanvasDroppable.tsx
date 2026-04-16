"use client";

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/react";

type CanvasDroppableProps = { children?: ReactNode; id?: string };

export function CanvasDroppable({ children, id }: CanvasDroppableProps) {
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
