import { z } from "zod";
import { baseQuestionFieldsSchema } from "./baseQuestionSchema";

const optionSchema = z.object({
   id: z.string().min(1),
   label: z.string().min(1, { message: "A válasz nem lehet üres" }),
});

export const multipleChoiceCheckboxQuestionSchema = baseQuestionFieldsSchema.extend({
   options: z.array(optionSchema).min(2, { message: "Legalább két válaszlehetőség szükséges" }),
   correctOptionIds: z.array(z.string()).min(1, { message: "Jelölj meg legalább egy helyes választ" }),
}).superRefine((data, ctx) => {
   const ids = new Set(data.options.map((o) => o.id));
   for (const cid of data.correctOptionIds) {
      if (!ids.has(cid)) {
         ctx.addIssue({ code: "custom", path: ["correctOptionIds"], message: "Érvénytelen választás" });
         return;
      }
   }
});

export type MultipleChoiceCheckboxQuestionFormValues = z.infer<typeof multipleChoiceCheckboxQuestionSchema>;
