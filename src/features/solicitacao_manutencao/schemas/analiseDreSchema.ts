import { Mensagens } from "@/constants/mensagens";
import { z } from "zod";

export const decisaoDreSchema = z.object({
  situacao: z.enum(["aprovada_dre", "reprovada", "necessidade_revisao"], {
    error: Mensagens.campo_obrigatorio,
  }),
});

export const enviarSolicitacaoGmeSmeSchema = z.object({
  observacoes: z
    .string({ error: Mensagens.campo_obrigatorio })
    .trim()
    .min(1, Mensagens.campo_obrigatorio),
});

export type DecisaoDreFormData = z.infer<typeof decisaoDreSchema>;
export type EnviarSolicitacaoGmeSmeFormData = z.infer<typeof enviarSolicitacaoGmeSmeSchema>;
