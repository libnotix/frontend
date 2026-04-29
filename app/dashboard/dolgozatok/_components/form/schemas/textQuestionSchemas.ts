import { z } from "zod";
import { baseQuestionFieldsSchema } from "./baseQuestionSchema";

const answerLineCountField = z.coerce
   .number({ message: "Adj meg érvényes sorok számát" })
   .int()
   .min(1, { message: "Legalább 1 sor" })
   .max(80, { message: "Legfeljebb 80 sor" });

/** Rövid válasz — sample / expected answer hint optional but bounded. */
export const shortTextQuestionSchema = baseQuestionFieldsSchema.extend({
   rubric: z.string().max(2000).optional(),
   answerLineCount: answerLineCountField.default(5),
});

/** Hosszú válasz — expect at least minimal guidance text for graders. */
export const longTextQuestionSchema = baseQuestionFieldsSchema.extend({
   rubric: z.string().min(1, { message: "Add meg az értékelési útmutatót vagy elvárt kulcspontokat" }).max(8000),
   answerLineCount: answerLineCountField.default(18),
});

export type ShortTextQuestionFormValues = z.infer<typeof shortTextQuestionSchema>;
export type LongTextQuestionFormValues = z.infer<typeof longTextQuestionSchema>;
