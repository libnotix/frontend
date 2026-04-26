import { z } from "zod";
import { baseQuestionFieldsSchema } from "./baseQuestionSchema";

export const groupingQuestionSchema = baseQuestionFieldsSchema.extend({
   groups: z
      .array(
         z.object({
            value: z.string().min(1, { message: "A csoport neve nem lehet üres" }),
         }),
      )
      .min(2, { message: "Legalább két csoport szükséges" }),
   items: z
      .array(
         z.object({
            value: z.string().min(1, { message: "Az elem szövege nem lehet üres" }),
         }),
      )
      .min(2, { message: "Legalább két elem szükséges" }),
});

export type GroupingQuestionFormValues = z.infer<typeof groupingQuestionSchema>;
