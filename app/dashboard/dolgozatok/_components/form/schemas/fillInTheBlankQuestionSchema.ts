import { z } from "zod";
import { baseQuestionFieldsSchema } from "./baseQuestionSchema";

const blankSegmentSchema = z.object({
   text: z.string().min(1, { message: "A szegmens nem lehet üres" }),
   acceptedAnswers: z.array(z.string().min(1, { message: "A minta válasz nem lehet üres" })).min(1, {
      message: "Legalább egy elfogadott válasz szükséges",
   }),
});

export const fillInTheBlankQuestionSchema = baseQuestionFieldsSchema.extend({
   leadText: z.string().optional(),
   blanks: z.array(blankSegmentSchema).min(1, { message: "Legalább egy lyuk szükséges" }),
});

export type FillInTheBlankQuestionFormValues = z.infer<typeof fillInTheBlankQuestionSchema>;
