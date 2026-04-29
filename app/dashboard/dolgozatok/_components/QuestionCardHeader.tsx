"use client";

import { useState, type Ref } from "react";
import {
   AlertCircle,
   ArrowUpToLine,
   CheckCircle2,
   ChevronDown,
   ChevronRight,
   Copy,
   GripVertical,
   MoreHorizontal,
   Trash2,
} from "lucide-react";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getTaskTypeMeta } from "./constants";
import type { ExamTaskTypeId } from "./examTaskTypes";

type QuestionCardHeaderProps = {
   index: number;
   typeId: ExamTaskTypeId;
   isCollapsed: boolean;
   onToggleCollapsed: () => void;
   isValid: boolean;
   hasInteracted: boolean;
   isDragging?: boolean;
   handleRef: (element: HTMLElement | null) => void;
   onDelete?: () => void;
   onDuplicate?: () => void;
   onMoveToTop?: () => void;
   canMoveToTop?: boolean;
};

export function QuestionCardHeader({
   index,
   typeId,
   isCollapsed,
   onToggleCollapsed,
   isValid,
   hasInteracted,
   isDragging = false,
   handleRef,
   onDelete,
   onDuplicate,
   onMoveToTop,
   canMoveToTop = true,
}: QuestionCardHeaderProps) {
   const [confirmOpen, setConfirmOpen] = useState(false);
   const meta = getTaskTypeMeta(typeId);
   const Icon = meta?.icon;
   const typeLabel = meta?.text ?? typeId;
   const ChevronIcon = isCollapsed ? ChevronRight : ChevronDown;

   const showStatus = hasInteracted;
   const statusValid = showStatus && isValid;
   const statusInvalid = showStatus && !isValid;

   return (
      <>
         <div
            ref={handleRef as unknown as Ref<HTMLDivElement>}
            className={cn(
               "flex touch-none select-none items-center gap-1.5 border-b border-border/50 bg-muted/15 px-2.5 py-1.5 md:px-3",
               isDragging ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing",
            )}
            title="Húzd a fejléc bármely részéről a sorrend változtatásához"
         >
            <span className="sr-only">Kérdés sorrendjének megváltoztatása: fogd meg és húzd a fejlécet.</span>
            <button
               type="button"
               onClick={onToggleCollapsed}
               aria-label={isCollapsed ? "Kérdés kibontása" : "Kérdés összecsukása"}
               aria-expanded={!isCollapsed}
               className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted/60 hover:text-foreground"
               onPointerDown={(event) => event.stopPropagation()}
            >
               <ChevronIcon className="size-3.5" />
            </button>

            <span
               className="flex size-7 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-inset ring-primary/15"
               aria-hidden
            >
               {Icon ? <Icon className="size-3.5" /> : null}
            </span>

            <div className="flex min-w-0 flex-1 items-baseline gap-1.5 text-[12px] font-medium leading-none">
               <span className="text-foreground">{index + 1}. kérdés</span>
               <span className="text-muted-foreground/50">·</span>
               <span className="truncate text-muted-foreground">{typeLabel}</span>
            </div>

            {statusValid ? (
               <span className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 sm:flex dark:text-emerald-400">
                  <CheckCircle2 className="size-3" />
                  Kész
               </span>
            ) : null}
            {statusInvalid ? (
               <span className="hidden items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive sm:flex">
                  <AlertCircle className="size-3" />
                  Javítandó
               </span>
            ) : null}

            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <button
                     type="button"
                     aria-label="Kérdés műveletek"
                     className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted/60 hover:text-foreground"
                     onPointerDown={(event) => event.stopPropagation()}
                  >
                     <MoreHorizontal className="size-4" />
                  </button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" sideOffset={6} className="min-w-44">
                  {onDuplicate ? (
                     <DropdownMenuItem onClick={onDuplicate}>
                        <Copy /> Duplikálás
                     </DropdownMenuItem>
                  ) : null}
                  {onMoveToTop && canMoveToTop ? (
                     <DropdownMenuItem onClick={onMoveToTop}>
                        <ArrowUpToLine /> Áthelyezés a tetejére
                     </DropdownMenuItem>
                  ) : null}
                  {onDelete && (onDuplicate || (onMoveToTop && canMoveToTop)) ? <DropdownMenuSeparator /> : null}
                  {onDelete ? (
                     <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
                        <Trash2 /> Törlés
                     </DropdownMenuItem>
                  ) : null}
               </DropdownMenuContent>
            </DropdownMenu>

            <span className="flex size-7 shrink-0 items-center justify-center text-muted-foreground/50" aria-hidden>
               <GripVertical className="size-4" />
            </span>
         </div>

         <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent size="sm">
               <AlertDialogHeader>
                  <AlertDialogTitle>Biztosan törlöd a kérdést?</AlertDialogTitle>
                  <AlertDialogDescription>
                     A {index + 1}. kérdés és minden adata véglegesen eltávolításra kerül a dolgozatból.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Mégse</AlertDialogCancel>
                  <AlertDialogAction
                     variant="destructive"
                     onClick={() => {
                        setConfirmOpen(false);
                        onDelete?.();
                     }}
                  >
                     Törlés
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
}
