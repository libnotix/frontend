import { z } from "zod";
import { baseQuestionFieldsSchema } from "./baseQuestionSchema";

const premiseSchema = z.object({
   value: z.string().min(1, { message: "A kifejezés nem lehet üres" }),
   correctResponseIndices: z.array(z.number().int().min(0)).default([]),
});

const responseSchema = z.object({
   value: z.string().min(1, { message: "A válasz nem lehet üres" }),
});

export const matchingQuestionSchema = baseQuestionFieldsSchema.extend({
   premises: z.array(premiseSchema).min(1, { message: "Legalább egy kifejezés szükséges" }),
   responses: z.array(responseSchema).min(1, { message: "Legalább egy válasz szükséges" }),
});

export type MatchingQuestionFormValues = z.infer<typeof matchingQuestionSchema>;
