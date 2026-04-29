"use client";

import { AlertTriangle, Loader2, RotateCcw, X, FileText, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ExamChatAttachmentChipItem = {
   localId: string;
   kind: "file" | "draft";
   label: string;
   status: "uploading" | "linking" | "ready" | "error";
   errorMessage?: string;
};

export type ExamChatAttachmentChipProps = {
   item: ExamChatAttachmentChipItem;
   onRemove: () => void;
   onRetry?: () => void;
};

export function ExamChatAttachmentChip({ item, onRemove, onRetry }: ExamChatAttachmentChipProps) {
   const Icon = item.kind === "draft" ? NotebookPen : FileText;
   const busy = item.status === "uploading" || item.status === "linking";

   return (
      <div
         className={cn(
            "flex max-w-[min(100%,280px)] flex-col gap-0.5 rounded-lg border px-2 py-1 text-[11px]",
            item.status === "error"
               ? "border-destructive/50 bg-destructive/5"
               : "border-border/70 bg-muted/40",
         )}
      >
         <div className="flex min-w-0 items-center gap-1.5">
            <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 flex-1 truncate font-medium" title={item.label}>
               {item.label}
            </span>
            {busy ? (
               <>
                  <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" aria-hidden />
                  <span className="shrink-0 text-muted-foreground">
                     {item.status === "uploading" ? "Feltöltés…" : "Csatolás…"}
                  </span>
               </>
            ) : null}
            {!busy && item.status === "error" ? (
               <>
                  <AlertTriangle className="size-3.5 shrink-0 text-destructive" aria-hidden />
                  {onRetry ? (
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="h-6 w-6 shrink-0"
                        onClick={() => onRetry()}
                        aria-label={`Újra: ${item.label}`}
                     >
                        <RotateCcw className="size-3" />
                     </Button>
                  ) : null}
               </>
            ) : null}
            {!busy ? (
               <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="h-6 w-6 shrink-0 text-muted-foreground"
                  onClick={onRemove}
                  aria-label={`Eltávolítás: ${item.label}`}
               >
                  <X className="size-3" />
               </Button>
            ) : null}
         </div>
         {item.errorMessage ? (
            <p className="line-clamp-2 pl-6 text-[10px] leading-tight text-destructive">{item.errorMessage}</p>
         ) : null}
      </div>
   );
}
