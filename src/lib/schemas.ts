import { z } from "zod";

export const loginStartSchema = z.object({
  email: z.email({ message: "Érvénytelen e-mail formátum" }),
});

export const loginEndSchema = z.object({
  email: z.email({ message: "Érvénytelen e-mail formátum" }),
  otp: z
    .string()
    .min(6, { message: "A kódnak legalább 6 karakternek kell lennie" }),
});

export const registerSchema = z.object({
  username: z.string().min(3, {
    message: "A felhasználónévnek legalább 3 karakternek kell lennie",
  }),
  email: z.email({ message: "Érvénytelen e-mail formátum" }),
  firstName: z.string().min(1, { message: "Kötelező megadni a vezetéknevet" }),
  lastName: z.string().min(1, { message: "Kötelező megadni a keresztnevet" }),
});

export type LoginStartInputs = z.infer<typeof loginStartSchema>;
export type LoginEndInputs = z.infer<typeof loginEndSchema>;
export type RegisterInputs = z.infer<typeof registerSchema>;

export const createClassSchema = z.object({
  className: z.string().trim().min(1, "Add meg az osztály nevét."),
  classNumber: z
    .number("Add meg az évfolyamot.")
    .refine(
      (n) => Number.isFinite(n) && !Number.isNaN(n),
      "Add meg az évfolyamot.",
    )
    .int("Egész szám legyen.")
    .min(1, "Az évfolyam legalább 1 legyen.")
    .max(20, "Az évfolyam legfeljebb 20 lehet."),
});

export type CreateClassInputs = z.infer<typeof createClassSchema>;

export const addStudentSchema = z.object({
  lastName: z.string().trim().min(1, "Add meg a vezetéknevet."),
  firstName: z.string().trim().min(1, "Add meg a keresztnevet."),
  email: z.union([
    z.literal(""),
    z.email({ message: "Érvénytelen e-mail formátum." }),
  ]),
});

export type AddStudentInputs = z.infer<typeof addStudentSchema>;
