import { z } from "zod";

import { Mensagens } from "@/constants/mensagens";

const obrigatorio = z.string().trim().min(1, Mensagens.campo_obrigatorio);

export const servicoManutencaoSchema = z
  .object({
    id: obrigatorio,
    servico: obrigatorio,
    servico_especifico: z.string().trim().optional(),
    local: obrigatorio,
    descricao: obrigatorio,
    arquivos: z
      .array(
        z
          .custom<File>((arquivo) => typeof File !== "undefined" && arquivo instanceof File, {
            error: "Selecione um arquivo válido.",
          })
          .refine(
            (arquivo) => /\.(png|jpe?g|pdf)$/i.test(arquivo.name),
            "Selecione arquivos PNG, JPG, JPEG ou PDF.",
          ),
      )
      .min(1, "Adicione pelo menos um arquivo do local do reparo."),
  })
  .superRefine((dados, ctx) => {
    if (dados.servico === "outros" && !dados.servico_especifico) {
      ctx.addIssue({
        code: "custom",
        path: ["servico_especifico"],
        message: Mensagens.campo_obrigatorio,
      });
    }
  });

export type ServicoManutencao = z.infer<typeof servicoManutencaoSchema>;
