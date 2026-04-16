"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { QuestionCardFooter } from "./QuestionCardFooter";
import { QuestionInactivePreview } from "./QuestionInactivePreview";
import { SortableDragHandle } from "./SortableDragHandle";
import { MatchingSection } from "./sections/MatchingSection";
import { MultipleChoiceSection } from "./sections/MultipleChoiceSection";
import { TextAnswerSection } from "./sections/TextAnswerSection";
import { TrueFalseSection } from "./sections/TrueFalseSection";
import type { ChoiceOption, MatchingPremise, MatchingResponse } from "./types";

type SortableQuestionItemProps = {
   id: string;
   typeId: string;
   index: number;
   isActive?: boolean;
   onDelete?: () => void;
};

export function SortableQuestionItem({ id, typeId, index, isActive = true, onDelete }: SortableQuestionItemProps) {
   const { ref, handleRef, isDragging } = useSortable({ id, index });

   const [options, setOptions] = useState<ChoiceOption[]>([
      { id: 1, value: "Teszt 1" },
      { id: 2, value: "Teszt 2" },
      { id: 3, value: "Teszt 3" },
      { id: 4, value: "Teszt 4" },
   ]);

   const [premises, setPremises] = useState<MatchingPremise[]>([
      { id: 1, value: "1. Kifejezés", correctResponses: [] },
      { id: 2, value: "2. Kifejezés", correctResponses: [] },
      { id: 3, value: "3. Kifejezés", correctResponses: [] },
   ]);

   const [responses, setResponses] = useState<MatchingResponse[]>([
      { id: 1, value: "A. Magyarázat" },
      { id: 2, value: "B. Magyarázat" },
      { id: 3, value: "C. Magyarázat" },
   ]);

   const changeOption = (optionId: number, value: string) => {
      setOptions((opts) => opts.map((opt) => (opt.id === optionId ? { ...opt, value } : opt)));
   };

   const removeOption = (optionId: number) => {
      setOptions((opts) => opts.filter((opt) => opt.id !== optionId));
   };

   const addOption = () => {
      setOptions((opts) => [...opts, { id: Date.now(), value: `Teszt ${opts.length + 1}` }]);
   };

   const addPremise = () => {
      setPremises((prev) => [...prev, { id: Date.now(), value: `${prev.length + 1}. Kifejezés`, correctResponses: [] }]);
   };

   const removePremise = (premiseId: number) => {
      setPremises((prev) => prev.filter((item) => item.id !== premiseId));
   };

   const changePremiseValue = (premiseId: number, value: string) => {
      setPremises((prev) => prev.map((p) => (p.id === premiseId ? { ...p, value } : p)));
   };

   const addResponse = () => {
      setResponses((prev) => [...prev, { id: Date.now(), value: `${String.fromCharCode(65 + prev.length)}. Magyarázat` }]);
   };

   const removeResponse = (responseId: number) => {
      setResponses((prev) => prev.filter((item) => item.id !== responseId));
   };

   const changeResponseValue = (responseId: number, value: string) => {
      setResponses((prev) => prev.map((p) => (p.id === responseId ? { ...p, value } : p)));
   };

   const toggleCorrectResponse = (premiseId: number, responseId: number) => {
      setPremises((prev) =>
         prev.map((p) => {
            if (p.id !== premiseId) return p;
            const current = p.correctResponses ?? [];
            const isSelected = current.includes(responseId);
            const next = isSelected ? current.filter((rid) => rid !== responseId) : [...current, responseId];
            return { ...p, correctResponses: next };
         }),
      );
   };

   return (
      <div ref={ref} className={`w-full pb-6 cursor-default ${isDragging ? "opacity-50" : ""}`}>
         <div
            className={`bg-card text-card-foreground p-6 w-full rounded-xl border-2 relative shadow-sm transition-colors ${isActive ? "border-primary" : "border-border"}`}
         >
            <div className="absolute -left-3 top-8 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
               {index + 1}
            </div>

            {isActive ? (
               <>
                  <div className="flex items-center justify-between">
                     <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center">Kérdés</div>
                  </div>
                  <div className="mb-6">
                     <Input
                        className="text-lg font-semibold py-6 border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
                        placeholder="Kattintson ide, majd adja meg a feladat címét"
                     />
                  </div>

                  <div className="flex flex-col gap-3 mb-6">
                     <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Leírás</Label>
                     <Textarea placeholder="További leírás hozzáadása..." className="resize-none h-32 bg-muted/30" />
                  </div>

                  {typeId === "item-1" && (
                     <MultipleChoiceSection
                        options={options}
                        onChangeOption={changeOption}
                        onRemoveOption={removeOption}
                        onAddOption={addOption}
                     />
                  )}

                  {typeId === "item-2" && <TrueFalseSection />}

                  {typeId === "item-3" && <TextAnswerSection />}

                  {typeId === "item-4" && (
                     <MatchingSection
                        premises={premises}
                        responses={responses}
                        onChangePremiseValue={changePremiseValue}
                        onRemovePremise={removePremise}
                        onAddPremise={addPremise}
                        onChangeResponseValue={changeResponseValue}
                        onRemoveResponse={removeResponse}
                        onAddResponse={addResponse}
                        onToggleCorrectResponse={toggleCorrectResponse}
                     />
                  )}

                  {typeId === "item-5" && <TextAnswerSection />}

                  <QuestionCardFooter onDelete={onDelete} />
               </>
            ) : (
               <QuestionInactivePreview typeId={typeId} />
            )}

            <SortableDragHandle handleRef={handleRef} />
         </div>
      </div>
   );
}
