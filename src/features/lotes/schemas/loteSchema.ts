import { Mensagens } from "@/constants/mensagens";
import { z } from "zod";

export const LoteSchema = z
  .object({
    codigo_cadastro: z.string().trim().min(1, {
      message: Mensagens.campo_obrigatorio,
    }),

    empresa: z.string().trim().min(1, {
      message: Mensagens.campo_obrigatorio,
    }),

    nome: z.string().trim().min(1, {
      message: Mensagens.campo_obrigatorio,
    }),

    periodo_inicial: z.string().min(1, {
      message: Mensagens.campo_obrigatorio,
    }),

    periodo_final: z.string().min(1, {
      message: Mensagens.campo_obrigatorio,
    }),

    status: z
      .enum(["true", "false"])
      .optional()
      .refine((value) => value !== undefined, {
        message: "Status é obrigatório!",
      }),

    diretorias_regionais: z.array(z.string()).min(1, {
      message: "Selecione pelo menos uma Diretoria Regional!",
    }),
  })
  .refine(
    (dados) =>
      !dados.periodo_inicial ||
      !dados.periodo_final ||
      dados.periodo_final >= dados.periodo_inicial,
    {
      message: "O período final não pode ser anterior ao período inicial.",
      path: ["periodo_final"],
    },
  );

export type LoteFormData = z.infer<typeof LoteSchema>;
