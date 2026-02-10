import { z } from "zod";

export const loginStartSchema = z.object({
  email: z.string().email({ message: "Érvénytelen e-mail formátum" }),
});

export const loginEndSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6, { message: "A kódnak legalább 6 karakternek kell lennie" }),
});

export const registerSchema = z.object({
  username: z.string().min(3, { message: "A felhasználónévnek legalább 3 karakternek kell lennie" }),
  email: z.email({ message: "Érvénytelen e-mail formátum" }),
  firstName: z.string().min(1, { message: "Kötelező megadni a vezetéknevet" }),
  lastName: z.string().min(1, { message: "Kötelező megadni a keresztnevet" }),
});

export type LoginStartInputs = z.infer<typeof loginStartSchema>;
export type LoginEndInputs = z.infer<typeof loginEndSchema>;
export type RegisterInputs = z.infer<typeof registerSchema>;
