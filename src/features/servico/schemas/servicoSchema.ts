import { Mensagens } from "@/constants/mensagens";
import { z } from "zod";

export const servicoSchema = z.object({
  nome: z.string().trim().min(1, { message: Mensagens.campo_obrigatorio }),

  status: z.boolean(),
});

export type ServiceFormData = z.infer<typeof servicoSchema>;
