import { z } from "zod";

/** Shared fields for every question card — extend per task type. */
export const baseQuestionFieldsSchema = z.object({
   title: z.string().min(1, { message: "A cím megadása kötelező" }),
   description: z.string().optional(),
   points: z.coerce
      .number({ message: "Érvényes pontszám szükséges" })
      .int()
      .min(1, { message: "Minimum 1 pont" })
      .max(100, { message: "Maximum 100 pont" }),
});

export type BaseQuestionFormValues = z.infer<typeof baseQuestionFieldsSchema>;
