import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import { EXAM_TASK_TYPE, type ExamTaskTypeId } from "../examTaskTypes";
import {
   fillInTheBlankQuestionSchema,
   groupingQuestionSchema,
   longTextQuestionSchema,
   matchingQuestionSchema,
   multipleChoiceCheckboxQuestionSchema,
   multipleChoiceRadioQuestionSchema,
   orderingQuestionSchema,
   shortTextQuestionSchema,
   trueFalseQuestionSchema,
} from "./schemas";

export type QuestionFormConfig = {
   resolver: Resolver<FieldValues>;
   defaultValues: FieldValues;
};

/**
 * Maps each exam task kind to its Zod schema + default form values.
 * Extend here when you add new task types or change validation per kind.
 */
export function getQuestionFormConfig(typeId: ExamTaskTypeId): QuestionFormConfig {
   switch (typeId) {
      case EXAM_TASK_TYPE.Radio: {
         const o1 = `opt_${Math.random().toString(36).slice(2, 10)}`;
         const o2 = `opt_${Math.random().toString(36).slice(2, 10)}`;
         const o3 = `opt_${Math.random().toString(36).slice(2, 10)}`;
         const o4 = `opt_${Math.random().toString(36).slice(2, 10)}`;
         return {
            resolver: zodResolver(multipleChoiceRadioQuestionSchema) as unknown as Resolver<FieldValues>,
            defaultValues: {
               title: "",
               description: "",
               points: 5,
               options: [
                  { id: o1, label: "Teszt 1" },
                  { id: o2, label: "Teszt 2" },
                  { id: o3, label: "Teszt 3" },
                  { id: o4, label: "Teszt 4" },
               ],
               correctOptionId: o1,
            },
         };
      }
      case EXAM_TASK_TYPE.Checkbox: {
         const o1 = `opt_${Math.random().toString(36).slice(2, 10)}`;
         const o2 = `opt_${Math.random().toString(36).slice(2, 10)}`;
         const o3 = `opt_${Math.random().toString(36).slice(2, 10)}`;
         const o4 = `opt_${Math.random().toString(36).slice(2, 10)}`;
         return {
            resolver: zodResolver(multipleChoiceCheckboxQuestionSchema) as unknown as Resolver<FieldValues>,
            defaultValues: {
               title: "",
               description: "",
               points: 5,
               options: [
                  { id: o1, label: "Teszt 1" },
                  { id: o2, label: "Teszt 2" },
                  { id: o3, label: "Teszt 3" },
                  { id: o4, label: "Teszt 4" },
               ],
               correctOptionIds: [o1],
            },
         };
      }

      case EXAM_TASK_TYPE.TrueFalse:
         return {
            resolver: zodResolver(trueFalseQuestionSchema) as unknown as Resolver<FieldValues>,
            defaultValues: {
               title: "",
               description: "",
               points: 5,
               correctAnswer: "igaz",
            },
         };

      case EXAM_TASK_TYPE.ShortAnswer:
         return {
            resolver: zodResolver(shortTextQuestionSchema) as unknown as Resolver<FieldValues>,
            defaultValues: {
               title: "",
               description: "",
               points: 5,
               rubric: "",
            },
         };

      case EXAM_TASK_TYPE.Matching:
         return {
            resolver: zodResolver(matchingQuestionSchema) as unknown as Resolver<FieldValues>,
            defaultValues: {
               title: "",
               description: "",
               points: 5,
               premises: [
                  { value: "1. Kifejezés", correctResponseIndices: [] as number[] },
                  { value: "2. Kifejezés", correctResponseIndices: [] as number[] },
                  { value: "3. Kifejezés", correctResponseIndices: [] as number[] },
               ],
               responses: [{ value: "A. Magyarázat" }, { value: "B. Magyarázat" }, { value: "C. Magyarázat" }],
            },
         };

      case EXAM_TASK_TYPE.Ordering:
         return {
            resolver: zodResolver(orderingQuestionSchema) as unknown as Resolver<FieldValues>,
            defaultValues: {
               title: "",
               description: "",
               points: 5,
               items: [{ value: "1. elem" }, { value: "2. elem" }],
            },
         };

      case EXAM_TASK_TYPE.Grouping:
         return {
            resolver: zodResolver(groupingQuestionSchema) as unknown as Resolver<FieldValues>,
            defaultValues: {
               title: "",
               description: "",
               points: 5,
               groups: [{ value: "A csoport" }, { value: "B csoport" }],
               items: [{ value: "Első elem" }, { value: "Második elem" }],
            },
         };

      case EXAM_TASK_TYPE.FillInTheBlank:
         return {
            resolver: zodResolver(fillInTheBlankQuestionSchema) as unknown as Resolver<FieldValues>,
            defaultValues: {
               title: "",
               description: "",
               points: 5,
               leadText: "",
               blanks: [{ text: "", acceptedAnswers: [""] }],
            },
         };

      case EXAM_TASK_TYPE.LongAnswer:
         return {
            resolver: zodResolver(longTextQuestionSchema) as unknown as Resolver<FieldValues>,
            defaultValues: {
               title: "",
               description: "",
               points: 5,
               rubric: "",
            },
         };
   }
}
