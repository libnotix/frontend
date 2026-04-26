"use client";

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/react";

type CanvasDroppableProps = {
   id: string;
   children: ReactNode;
   /**
    * When true (default), the zone fills the parent height (canvas drop areas).
    * When false, height follows content so a scroll parent can show all palette items.
    */
   fillParent?: boolean;
};

export function CanvasDroppable({ id, children, fillParent = true }: CanvasDroppableProps) {
   const { isDropTarget, ref } = useDroppable({ id });

   return (
      <div
         ref={ref}
         className={`w-full flex flex-col items-center justify-start p-2 rounded-md transition-colors ${
            fillParent ? "h-full min-h-0" : "min-h-min"
         } ${isDropTarget ? "bg-black/5 dark:bg-white/10" : ""}`}
      >
         {children}
      </div>
   );
}
