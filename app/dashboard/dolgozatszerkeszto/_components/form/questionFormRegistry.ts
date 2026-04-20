import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import { EXAM_TASK_TYPE, type ExamTaskTypeId } from "../examTaskTypes";
import {
   longTextQuestionSchema,
   matchingQuestionSchema,
   multipleChoiceQuestionSchema,
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
      case EXAM_TASK_TYPE.MultipleChoice:
         return {
            resolver: zodResolver(multipleChoiceQuestionSchema) as unknown as Resolver<FieldValues>,
            defaultValues: {
               title: "",
               description: "",
               points: 5,
               options: [{ value: "Teszt 1" }, { value: "Teszt 2" }, { value: "Teszt 3" }, { value: "Teszt 4" }],
            },
         };

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
