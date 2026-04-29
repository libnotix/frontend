"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "../SectionHeader";
import { DiffLeaf } from "../aiEdit/diffPrimitives";

type TextAnswerSectionProps = {
   variant: "short" | "long";
};

const COPY = {
   short: {
      label: "Mintaválasz / megjegyzés a tanárnak",
      helper: "Csak neked látszik – emlékeztetőül szolgál a javításhoz. A diák szabályozott számú írósorral kap papírt.",
      placeholder: "pl. „A fotoszintézis a klorofillban zajlik.” (opcionális)",
      linesLabel: "Írósorok száma a diáknak",
      linesHelper: "Előnézeten és nyomtatáskor ennyi vonal jelenik meg a válaszadáshoz.",
      defaultLines: 5,
   },
   long: {
      label: "Értékelési útmutató",
      helper: "Add meg a kulcspontokat, várt szöveghosszt vagy követelményeket – ez kötelező mező a hosszú válasznál.",
      placeholder: "Kulcspontok, szöveghossz, követelmények…",
      linesLabel: "Írósorok száma a diáknak",
      linesHelper: "Meghatározza, hogy a feladatlapon hány vonal legyen a kézzel írt válasznak.",
      defaultLines: 18,
   },
} as const;

export function TextAnswerSection({ variant }: TextAnswerSectionProps) {
   const { control, formState } = useFormContext();
   const copy = COPY[variant];
   const error =
      typeof formState.errors.rubric?.message === "string" ? formState.errors.rubric.message : undefined;

   return (
      <div className="mb-5 space-y-5">
         <SectionHeader label={copy.linesLabel} helper={copy.linesHelper} />
         <Controller
            name="answerLineCount"
            control={control}
            render={({ field }) => (
               <DiffLeaf path="answerLineCount">
                  <Input
                     type="number"
                     min={1}
                     max={80}
                     className="max-w-32 bg-muted"
                     value={field.value ?? copy.defaultLines}
                     onChange={(e) => {
                        const v = e.target.valueAsNumber;
                        field.onChange(Number.isFinite(v) ? v : copy.defaultLines);
                     }}
                     onBlur={field.onBlur}
                     onPointerDown={(e) => e.stopPropagation()}
                  />
               </DiffLeaf>
            )}
         />

         <SectionHeader label={copy.label} helper={copy.helper} error={error} />

         <Controller
            name="rubric"
            control={control}
            render={({ field }) => (
               <DiffLeaf path="rubric">
                  <Textarea
                     {...field}
                     value={field.value ?? ""}
                     placeholder={copy.placeholder}
                     className="min-h-24 resize-y bg-muted text-sm leading-snug"
                     onPointerDown={(e) => e.stopPropagation()}
                  />
               </DiffLeaf>
            )}
         />
      </div>
   );
}
