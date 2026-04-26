import { z } from "zod";
import { baseQuestionFieldsSchema } from "./baseQuestionSchema";

const optionSchema = z.object({
   id: z.string().min(1),
   label: z.string().min(1, { message: "A válasz nem lehet üres" }),
});

export const multipleChoiceRadioQuestionSchema = baseQuestionFieldsSchema.extend({
   options: z.array(optionSchema).min(2, { message: "Legalább két válaszlehetőség szükséges" }),
   correctOptionId: z.string().min(1, { message: "Jelölj meg egy helyes választ" }),
}).superRefine((data, ctx) => {
   const ids = new Set(data.options.map((o) => o.id));
   if (!ids.has(data.correctOptionId)) {
      ctx.addIssue({ code: "custom", path: ["correctOptionId"], message: "Érvénytelen választás" });
   }
});

export type MultipleChoiceRadioQuestionFormValues = z.infer<typeof multipleChoiceRadioQuestionSchema>;
