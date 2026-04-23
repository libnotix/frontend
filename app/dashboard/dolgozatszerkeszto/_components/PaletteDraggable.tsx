"use client";

import { useDraggable } from "@dnd-kit/react";
import { taskTypeLabel } from "./constants";
import type { ExamTaskTypeId } from "./examTaskTypes";

type PaletteDraggableProps = { id: string; typeId: ExamTaskTypeId };

export function PaletteDraggable({ id, typeId }: PaletteDraggableProps) {
   const { ref } = useDraggable({ id });

   return (
      <button
         ref={ref}
         type="button"
         className="bg-primary text-primary-foreground px-6 py-3 mb-4 w-full h-15 font-semibold cursor-grab active:cursor-grabbing shadow-lg hover:bg-primary/90 transition-colors"
      >
         {taskTypeLabel(typeId)}
      </button>
   );
}
