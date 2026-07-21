import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().trim().min(1),

  senha: z.string().min(1),
});

export type LoginFormData = z.infer<typeof loginSchema>;
