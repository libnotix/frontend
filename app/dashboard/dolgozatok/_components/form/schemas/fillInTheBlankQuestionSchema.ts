import { z } from "zod";
import { baseQuestionFieldsSchema } from "./baseQuestionSchema";

const blankRowSchema = z.object({
   /** Szöveg a lyuk előtt */
   text: z.string().optional(),
   /** Szöveg a lyuk után (a következő lyuk előtti szöveg külön mezőben marad) */
   afterText: z.string().optional(),
   acceptedAnswers: z.array(z.string().min(1, { message: "A minta válasz nem lehet üres" })).min(1, {
      message: "Legalább egy elfogadott válasz szükséges",
   }),
});

export const fillInTheBlankQuestionSchema = baseQuestionFieldsSchema.extend({
   blanks: z.array(blankRowSchema).min(1, { message: "Legalább egy lyuk szükséges" }),
});

export type FillInTheBlankQuestionFormValues = z.infer<typeof fillInTheBlankQuestionSchema>;
