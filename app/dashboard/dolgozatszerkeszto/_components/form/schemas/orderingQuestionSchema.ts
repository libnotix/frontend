import { z } from "zod";
import { baseQuestionFieldsSchema } from "./baseQuestionSchema";

export const orderingQuestionSchema = baseQuestionFieldsSchema.extend({
   items: z
      .array(
         z.object({
            value: z.string().min(1, { message: "A tétel nem lehet üres" }),
         }),
      )
      .min(2, { message: "Legalább két tétel szükséges" }),
});

export type OrderingQuestionFormValues = z.infer<typeof orderingQuestionSchema>;
