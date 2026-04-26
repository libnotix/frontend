import { z } from "zod";
import { baseQuestionFieldsSchema } from "./baseQuestionSchema";

/** Rövid válasz — sample / expected answer hint optional but bounded. */
export const shortTextQuestionSchema = baseQuestionFieldsSchema.extend({
   rubric: z.string().max(2000).optional(),
});

/** Hosszú válasz — expect at least minimal guidance text for graders. */
export const longTextQuestionSchema = baseQuestionFieldsSchema.extend({
   rubric: z.string().min(1, { message: "Add meg az értékelési útmutatót vagy elvárt kulcspontokat" }).max(8000),
});

export type ShortTextQuestionFormValues = z.infer<typeof shortTextQuestionSchema>;
export type LongTextQuestionFormValues = z.infer<typeof longTextQuestionSchema>;
