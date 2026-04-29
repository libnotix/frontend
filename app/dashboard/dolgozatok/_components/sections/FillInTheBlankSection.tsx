"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { fillInBlankUnderlineWidthCh } from "../fillInBlankUnderline";
import { SectionHeader } from "../SectionHeader";
import { DiffLeaf } from "../aiEdit/diffPrimitives";

type BlankValue = { text?: string; afterText?: string; acceptedAnswers?: string[] };

export function FillInTheBlankSection() {
   const { control } = useFormContext();
   const { fields, append, remove } = useFieldArray({ control, name: "blanks" });

   const blanks = (useWatch({ control, name: "blanks" }) as BlankValue[] | undefined) ?? [];

   return (
      <div className="mb-5 space-y-4">
         <SectionHeader
            label="Lyukas szöveg"
            helper="Minden lyukhoz add meg a szöveget előtte és utána, valamint az elfogadott választ. Az utolsó lyuk „utána” mezője a záró szöveg (nincs külön mező)."
         />

         <div className="space-y-3">
            {fields.map((field, index) => (
               <div key={field.id} className="rounded-lg border border-border/70 bg-card/60 p-3">
                  <div className="mb-3 flex items-center justify-between">
                     <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {index + 1}. lyuk
                     </span>
                     <button
                        type="button"
                        aria-label="Lyuk törlése"
                        title="Lyuk törlése"
                        className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => remove(index)}
                     >
                        <Trash2 className="h-4 w-4" />
                     </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                     <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-muted-foreground">Szöveg a lyuk előtt</span>
                        <Controller
                           name={`blanks.${index}.text`}
                           control={control}
                           render={({ field: inputField }) => (
                              <DiffLeaf path={`blanks.${index}.text`}>
                                 <Input
                                    {...inputField}
                                    placeholder="pl. „A hidrogén jele "
                                    className="bg-muted"
                                    onPointerDown={(event) => event.stopPropagation()}
                                 />
                              </DiffLeaf>
                           )}
                        />
                     </label>
                     <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-muted-foreground">Elfogadott válasz</span>
                        <Controller
                           name={`blanks.${index}.acceptedAnswers.0`}
                           control={control}
                           render={({ field: answerField }) => (
                              <DiffLeaf path={`blanks.${index}.acceptedAnswers.0`}>
                                 <Input
                                    {...answerField}
                                    placeholder="pl. H"
                                    className="bg-muted"
                                    onPointerDown={(event) => event.stopPropagation()}
                                 />
                              </DiffLeaf>
                           )}
                        />
                     </label>
                  </div>
                  <label className="mt-3 flex flex-col gap-1">
                     <span className="text-[11px] font-medium text-muted-foreground">Szöveg a lyuk után</span>
                     <Controller
                        name={`blanks.${index}.afterText`}
                        control={control}
                        render={({ field: afterField }) => (
                           <DiffLeaf path={`blanks.${index}.afterText`}>
                              <Input
                                 {...afterField}
                                 value={afterField.value ?? ""}
                                 placeholder="pl. „ . A hélium jele a He."
                                 className="bg-muted"
                                 onPointerDown={(event) => event.stopPropagation()}
                              />
                           </DiffLeaf>
                        )}
                     />
                  </label>
               </div>
            ))}
         </div>

         <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
            onClick={() => append({ text: "", afterText: "", acceptedAnswers: [""] })}
         >
            <Plus className="h-4 w-4" />
            Lyuk hozzáadása
         </button>

         <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-2.5">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Előnézet</p>
            <p className="text-sm leading-relaxed text-foreground">
               {blanks.length === 0 ? (
                  <span className="text-muted-foreground">Add hozzá az első lyukat a szöveg felépítéséhez…</span>
               ) : (
                  <>
                     {blanks.map((blank, index) => {
                        const text = (blank.text ?? "").trim();
                        const after = (blank.afterText ?? "").trim();
                        const w = fillInBlankUnderlineWidthCh(blank.acceptedAnswers);
                        return (
                           <span key={`preview-${index}`} className="inline">
                              {text ? <span className="whitespace-pre-wrap">{text}</span> : null}
                              <span
                                 className="mx-[0.35em] inline-block box-border min-h-[1.15em] align-baseline border-b-2 border-primary/90"
                                 style={{ width: w, minWidth: w }}
                                 title="Kitöltendő hely"
                                 aria-hidden
                              >
                                 &nbsp;
                              </span>
                              {after ? <span className="whitespace-pre-wrap">{after}</span> : null}
                           </span>
                        );
                     })}
                  </>
               )}
            </p>
         </div>
      </div>
   );
}
