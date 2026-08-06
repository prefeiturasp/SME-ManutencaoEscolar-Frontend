import { Mensagens } from "@/constants/mensagens";
import { z } from "zod";

export const recuperarSenhaSchema = z.object({
  login: z
    .string()
    .trim()
    .min(7, {
      message: Mensagens.campo_obrigatorio,
    })
    .max(11, {
      message: Mensagens.campo_obrigatorio,
    }),
});

export type RecuperarSenhaFormData = z.infer<typeof recuperarSenhaSchema>;
