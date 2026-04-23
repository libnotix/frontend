import { z } from "zod";
import { baseQuestionFieldsSchema } from "./baseQuestionSchema";

export const trueFalseQuestionSchema = baseQuestionFieldsSchema.extend({
   correctAnswer: z.enum(["igaz", "hamis"]),
});

export type TrueFalseQuestionFormValues = z.infer<typeof trueFalseQuestionSchema>;
