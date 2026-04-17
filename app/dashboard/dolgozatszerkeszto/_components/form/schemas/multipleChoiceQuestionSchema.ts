import { z } from "zod";
import { baseQuestionFieldsSchema } from "./baseQuestionSchema";

export const multipleChoiceQuestionSchema = baseQuestionFieldsSchema.extend({
   options: z
      .array(
         z.object({
            value: z.string().min(1, { message: "A válasz nem lehet üres" }),
         }),
      )
      .min(2, { message: "Legalább két válaszlehetőség szükséges" }),
});

export type MultipleChoiceQuestionFormValues = z.infer<typeof multipleChoiceQuestionSchema>;
