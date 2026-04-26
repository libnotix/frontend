import { z } from "zod";

/** Worksheet-level meta; tighten (e.g. min length) when you add “publish” or “save”. */
export const dolgozatMetaSchema = z.object({
   title: z.string().max(200, { message: "Legfeljebb 200 karakter" }).optional(),
});

export type DolgozatMetaFormValues = z.infer<typeof dolgozatMetaSchema>;
