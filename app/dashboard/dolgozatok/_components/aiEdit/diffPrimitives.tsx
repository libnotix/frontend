"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { DiffLeafKind } from "./diffEngine";
import { useExamCardDiff } from "./ExamCardDiffContext";

/** Leaf path must match dotted form paths (`title`, `options.0.label`, `options.__added.x.label`). */
export type DiffLeafProps = {
   path: string;
   children: ReactNode;
   className?: string;
   /**
    * `merged`: highlight the live control with the emerald outline instead of rendering a duplicate
    * proposal above it (use for compact scalars like points or true/false toggles).
    */
   previewMode?: "stacked" | "merged";
};

function formatDisplay(value: unknown): string {
   if (value === null || value === undefined) return "";
   if (typeof value === "string") return value;
   if (typeof value === "number" || typeof value === "boolean") return String(value);
   try {
      return JSON.stringify(value);
   } catch {
      return String(value);
   }
}

function hasVisibleProposedAfter(after: unknown): boolean {
   if (after === undefined) return false;
   return formatDisplay(after).trim() !== "";
}

/** Ignore spurious `changed` rows where before/after render the same (e.g. number vs numeric string). */
function isDisplayNoOpChange(entry: { kind: DiffLeafKind; before?: unknown; after?: unknown }): boolean {
   if (entry.kind !== "changed") return false;
   return formatDisplay(entry.before) === formatDisplay(entry.after);
}

export function DiffLeaf({
   path,
   children,
   className,
   previewMode = "stacked",
}: DiffLeafProps) {
   const ctx = useExamCardDiff();
   const entry = ctx?.getDiffAt(path);
   if (!entry || isDisplayNoOpChange(entry)) return <div className={cn("min-w-0", className)}>{children}</div>;
   const kind = entry?.kind;

   const showStrikeBefore = kind === "changed" && entry?.before !== undefined;
   const showRemovedOnly = kind === "removed";
   const showProposedGlow =
      (kind === "changed" || kind === "added") &&
      entry?.after !== undefined &&
      hasVisibleProposedAfter(entry.after);

   const mergedGlow = previewMode === "merged" && showProposedGlow;
   const stackedGlow = previewMode === "stacked" && showProposedGlow;

   const proposalOutline =
      "rounded-md px-2 py-1.5 outline outline-2 -outline-offset-2 outline-emerald-500/55 bg-emerald-500/5 dark:bg-emerald-500/10";

   return (
      <div className={cn("relative min-w-0 w-full space-y-1", className)}>
         {showStrikeBefore ? (
            <p className="text-muted-foreground line-through decoration-muted-foreground/80 text-[0.85em] leading-snug whitespace-pre-wrap break-words">
               {formatDisplay(entry!.before)}
            </p>
         ) : null}
         {stackedGlow ? (
            <div className={proposalOutline} aria-live="polite">
               <span className="text-sm whitespace-pre-wrap break-words">{formatDisplay(entry!.after)}</span>
            </div>
         ) : null}
         <div
            aria-live={mergedGlow ? "polite" : undefined}
            className={cn(
               "min-w-0",
               showRemovedOnly &&
                  "[&_input]:pointer-events-none opacity-55 line-through decoration-muted-foreground/80",
               showStrikeBefore && "opacity-95",
               mergedGlow && proposalOutline,
            )}
         >
            {children}
         </div>
      </div>
   );
}

export type DiffListRowProps = {
   /** `"options"` or `"blanks"` */
   basePath: string;
   /** Field array index in live form row. */
   rowIndex: number;
   stableId?: string | null;
   children: ReactNode;
   className?: string;
};

/**
 * Applies row-level visual state from index-based removals; added-option ghosts are keyed by `options.__added.<id>` on separate rows.
 */
export function DiffListRow({ basePath, rowIndex, children, className }: DiffListRowProps) {
   const ctx = useExamCardDiff();
   const pathTest = `${basePath}.__removed.${rowIndex}.label`;
   const altValue = `${basePath}.__removed.${rowIndex}.value`;
   const dm = ctx?.diffMap ?? null;
   const isRemovedRow =
      dm !== null &&
      dm !== undefined &&
      (pathTest in dm || altValue in dm);

   return (
      <div
         className={cn(
            isRemovedRow &&
               "ring-2 ring-red-400/55 bg-red-400/10 dark:bg-red-500/10 rounded-md opacity-95",
            className,
         )}
      >
         {children}
      </div>
   );
}

export function diffToneClass(kind?: DiffLeafKind | null): string {
   switch (kind) {
      case "added":
         return "ring-2 ring-emerald-500/40";
      case "removed":
         return "line-through opacity-60";
      case "changed":
         return "";
      default:
         return "";
   }
}
