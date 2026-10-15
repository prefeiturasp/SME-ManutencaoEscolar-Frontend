import { Mensagens } from "@/constants/mensagens";
import { z } from "zod";

const selecaoObrigatoria = z.string().trim().min(1, {
  message: Mensagens.campo_obrigatorio,
});

export const ProfissionalEquipeSchema = z.object({
  profissional: selecaoObrigatoria,
  funcao: selecaoObrigatoria,
});

export const EquipeSchema = z.object({
  nome: z.string().trim().min(1, {
    message: Mensagens.campo_obrigatorio,
  }),

  situacao: z
    .enum(["true", "false"])
    .optional()
    .refine((value) => value !== undefined, {
      message: "Situação é obrigatória!",
    }),

  empresa: selecaoObrigatoria,

  lote: selecaoObrigatoria,

  profissionais: z.array(ProfissionalEquipeSchema).min(1, {
    message: "Adicione pelo menos um profissional!",
  }),
});

export type EquipeFormData = z.infer<typeof EquipeSchema>;

export type ProfissionalEquipeFormData = z.infer<typeof ProfissionalEquipeSchema>;
