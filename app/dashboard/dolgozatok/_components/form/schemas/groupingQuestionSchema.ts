import { z } from "zod";
import { baseQuestionFieldsSchema } from "./baseQuestionSchema";

export const groupingQuestionSchema = baseQuestionFieldsSchema
   .extend({
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
               correctGroupIndex: z.coerce
                  .number({ message: "Válassz csoportot" })
                  .int()
                  .min(0, { message: "Érvénytelen csoport" }),
            }),
         )
         .min(2, { message: "Legalább két elem szükséges" }),
   })
   .superRefine((data, ctx) => {
      const n = data.groups.length;
      data.items.forEach((item, i) => {
         if (item.correctGroupIndex >= n) {
            ctx.addIssue({
               code: z.ZodIssueCode.custom,
               message: "A választott csoport nem létezik",
               path: ["items", i, "correctGroupIndex"],
            });
         }
      });
   });

export type GroupingQuestionFormValues = z.infer<typeof groupingQuestionSchema>;
