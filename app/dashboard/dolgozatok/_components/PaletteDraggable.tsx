"use client";

import { useDraggable } from "@dnd-kit/react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTaskTypeMeta, taskTypeLabel } from "./constants";
import type { ExamTaskTypeId } from "./examTaskTypes";

type PaletteDraggableProps = { id: string; typeId: ExamTaskTypeId };

export function PaletteDraggable({ id, typeId }: PaletteDraggableProps) {
   const { ref, isDragging } = useDraggable({ id });
   const meta = getTaskTypeMeta(typeId);
   const label = meta?.text ?? taskTypeLabel(typeId) ?? "Feladat";
   const description = meta?.description;
   const Icon = meta?.icon;

   return (
      <button
         ref={ref}
         type="button"
         aria-label={`${label} feladat hozzáadása`}
         className={cn(
            /* Inner nodes must not be pointer targets: @dnd-kit treats descendants of <button> as
               "interactive" and blocks drag activation unless event.target is the button itself. */
            "group relative mb-2.5 flex w-full touch-none select-none items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5 text-left shadow-sm transition-all duration-150 ease-out",
            "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "active:translate-y-0 active:shadow-sm",
            isDragging
               ? "rotate-[0.6deg] cursor-grabbing border-primary/60 opacity-90 shadow-lg ring-2 ring-primary/30"
               : "cursor-grab",
         )}
      >
         <span className="pointer-events-none flex w-full min-w-0 items-center gap-3">
            <span
               className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-inset ring-primary/15 transition-colors",
                  "group-hover:from-primary/20 group-hover:to-primary/10 group-hover:ring-primary/25",
               )}
               aria-hidden
            >
               {Icon ? <Icon className="size-4" /> : null}
            </span>

            <span className="flex min-w-0 flex-1 flex-col">
               <span className="truncate text-[13px] font-semibold leading-tight text-foreground">{label}</span>
               {description ? (
                  <span className="mt-0.5 truncate text-[11px] leading-snug text-muted-foreground">{description}</span>
               ) : null}
            </span>

            <GripVertical
               className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/80"
               aria-hidden
            />
         </span>
      </button>
   );
}
