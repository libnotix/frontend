import { z } from "zod";

/** Worksheet-level meta; tighten (e.g. min length) when you add “publish” or “save”. */
export const dolgozatMetaSchema = z.object({
   title: z.string().trim().min(1, { message: "Adj címet a dolgozatnak" }).max(200, { message: "Legfeljebb 200 karakter" }),
});

export type DolgozatMetaFormValues = z.infer<typeof dolgozatMetaSchema>;
