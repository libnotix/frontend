"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DiffLeaf } from "../aiEdit/diffPrimitives";
import { useExamCardDiff } from "../aiEdit/ExamCardDiffContext";

export function QuestionHeaderFields() {
   const { control, formState } = useFormContext();
   const description = (useWatch({ control, name: "description" }) as string | undefined) ?? "";
   const cardDiff = useExamCardDiff();
   const hasDescDiff = !!(cardDiff?.diffMap && "description" in cardDiff.diffMap);
   const [showDescription, setShowDescription] = useState(() => description.trim().length > 0);

   const revealDescription = showDescription || hasDescDiff;

   return (
      <div className="mb-5">
         <Controller
            name="title"
            control={control}
            render={({ field }) => (
               <DiffLeaf path="title">
                  <Input
                     {...field}
                     placeholder="Add meg a feladat címét…"
                     className="h-auto rounded-none border-x-0 border-t-0 border-b border-transparent bg-transparent px-0 py-1.5 text-base font-semibold leading-snug shadow-none transition-colors hover:border-border focus-visible:border-primary/60 focus-visible:ring-0"
                  />
               </DiffLeaf>
            )}
         />
         {formState.errors.title?.message ? (
            <p className="mt-1 text-xs text-destructive">{String(formState.errors.title.message)}</p>
         ) : null}

         {revealDescription ? (
            <div className="mt-3">
               <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                     <DiffLeaf path="description">
                        <Textarea
                           {...field}
                           value={field.value ?? ""}
                           placeholder="Rövid leírás vagy útmutató (opcionális)…"
                           rows={2}
                           className="min-h-16 resize-y bg-muted text-sm leading-snug"
                        />
                     </DiffLeaf>
                  )}
               />
            </div>
         ) : (
            <button
               type="button"
               onClick={() => setShowDescription(true)}
               className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
               onPointerDown={(event) => event.stopPropagation()}
            >
               <Plus className="size-3.5" />
               Leírás hozzáadása
            </button>
         )}
      </div>
   );
}
