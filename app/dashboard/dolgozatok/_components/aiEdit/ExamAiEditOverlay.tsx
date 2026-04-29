"use client";

import { ArrowDown, ArrowUp, Trash2, PlusCircle } from "lucide-react";
import type { ExamQuestionEdit } from "@/api";
import { Button } from "@/components/ui/button";
import type { FieldDiffMap, DiffLeaf } from "./diffEngine";
import { cn } from "@/lib/utils";

const META_KEYS = new Set(["title", "description", "points", "rubric", "answerLineCount"]);

export function pickMetaSlice(diffMap: FieldDiffMap | null): FieldDiffMap | null {
   if (!diffMap || Object.keys(diffMap).length === 0) return null;
   const slice: FieldDiffMap = {};
   for (const [k, v] of Object.entries(diffMap)) {
      if (META_KEYS.has(k.split(".")[0] ?? "")) slice[k] = v;
   }
   return Object.keys(slice).length ? slice : null;
}

function MetaStrip({ meta }: { meta: FieldDiffMap }) {
   return (
      <div className="mb-3 space-y-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-xs">
         <p className="font-semibold text-foreground/90">Meta mezők</p>
         <ul className="space-y-1 text-muted-foreground">
            {Object.entries(meta).map(([path, leaf]) => (
               <li key={path} className="leading-snug">
                  <span className="text-foreground/70">{path}:</span>{" "}
                  <MetaLeaf leaf={leaf} />
               </li>
            ))}
         </ul>
      </div>
   );
}

function MetaLeaf({ leaf }: { leaf: DiffLeaf }) {
   if (leaf.kind === "removed") return <span className="line-through">{formatVal(leaf.before)}</span>;
   if (leaf.kind === "added") return <span className="text-emerald-600 dark:text-emerald-400">{formatVal(leaf.after)}</span>;
   return (
      <span>
         <span className="line-through opacity-70">{formatVal(leaf.before)}</span>
         <span className="mx-1">→</span>
         <span className="text-emerald-600 dark:text-emerald-400">{formatVal(leaf.after)}</span>
      </span>
   );
}

function formatVal(v: unknown): string {
   if (v === null || v === undefined) return "—";
   if (typeof v === "string") return v;
   if (typeof v === "number" || typeof v === "boolean") return String(v);
   try {
      return JSON.stringify(v);
   } catch {
      return String(v);
   }
}

export type ExamAiEditOverlayProps = {
   op: ExamQuestionEdit;
   /** Card-level field diff (title, description, points, rubric, …). */
   diffMap?: FieldDiffMap | null;
   onAccept: () => void;
   onReject: () => void;
   disabled?: boolean;
};

export function ExamAiEditOverlay({ op, diffMap, onAccept, onReject, disabled }: ExamAiEditOverlayProps) {
   const meta = pickMetaSlice(diffMap ?? null);

   const tint =
      op.op === "delete"
         ? "border-red-400/55 bg-red-500/15"
         : op.op === "create"
           ? "border-emerald-500/55 bg-emerald-500/10"
           : op.op === "reorder"
             ? "border-amber-500/45 bg-amber-500/10"
             : "border-primary/35 bg-background/95";

   return (
      <div className={cn("mb-3 rounded-lg border p-3 shadow-sm backdrop-blur-sm", tint)}>
         <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
               AI javaslat
            </span>
            <OpBadge op={op} />
         </div>
         {meta ? <MetaStrip meta={meta} /> : null}
         <div className="flex flex-wrap items-center gap-2">
            {op.op === "reorder" ? (
               <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <ArrowUp className="size-3.5" aria-hidden />
                  <ArrowDown className="size-3.5" aria-hidden />
                  Húzd a kártyákat a javasolt sorrendhez (elfogadás után mentjük).
               </span>
            ) : null}
         </div>
         <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={onAccept} disabled={disabled}>
               Elfogadom
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onReject} disabled={disabled}>
               Elutasítom
            </Button>
         </div>
      </div>
   );
}

function OpBadge({ op }: { op: ExamQuestionEdit }) {
   const map: Record<string, { label: string; icon: typeof Trash2 }> = {
      update: { label: "Módosítás", icon: PlusCircle },
      create: { label: "Új feladat", icon: PlusCircle },
      delete: { label: "Törlés", icon: Trash2 },
      reorder: { label: "Sorrend", icon: ArrowUp },
   };
   const entry = map[op.op] ?? map.update;
   const Icon = entry.icon;
   return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/80 px-2 py-0.5 text-[11px] font-semibold text-foreground">
         <Icon className="size-3 opacity-80" aria-hidden />
         {entry.label}
      </span>
   );
}

/** Full-card wash for delete proposal (under header, over body). */
export function ExamAiDeleteWash() {
   return (
      <div
         className="pointer-events-none absolute inset-0 z-[1] rounded-b-xl bg-red-500/15 ring-1 ring-inset ring-red-400/50"
         aria-hidden
      />
   );
}
