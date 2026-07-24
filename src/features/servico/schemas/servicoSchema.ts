import { z } from "zod";

export const servicoSchema = z.object({
  nome: z.string().trim().min(1),

  status: z.boolean(),
});

export type ServiceFormData = z.infer<typeof servicoSchema>;
