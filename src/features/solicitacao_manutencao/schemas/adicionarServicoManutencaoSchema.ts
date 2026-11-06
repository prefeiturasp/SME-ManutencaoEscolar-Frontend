import { z } from "zod";

import { Mensagens } from "@/constants/mensagens";

const obrigatorio = z.string().trim().min(1, Mensagens.campo_obrigatorio);

export const servicoManutencaoSchema = z
  .object({
    id: obrigatorio,
    servico: obrigatorio,
    servico_especifico: z.string().trim().optional(),
    local_reparo: obrigatorio,
    descricao: obrigatorio,
    arquivosExistentes: z
      .array(
        z.object({
          uuid: z.string(),
          arquivo: z.string(),
          nome_original: z.string().nullable().optional(),
        }),
      )
      .optional(),
    arquivos: z.array(
      z
        .custom<File>((arquivo) => typeof File !== "undefined" && arquivo instanceof File, {
          error: "Selecione um arquivo válido.",
        })
        .refine(
          (arquivo) => /\.(png|jpe?g)$/i.test(arquivo.name),
          "Selecione arquivos PNG, JPG, JPEG.",
        ),
    ),
  })
  .superRefine((dados, ctx) => {
    if (dados.arquivos.length + (dados.arquivosExistentes?.length ?? 0) === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["arquivos"],
        message: "Adicione pelo menos um arquivo do local do reparo.",
      });
    }
    if (dados.servico === "outros" && !dados.servico_especifico) {
      ctx.addIssue({
        code: "custom",
        path: ["servico_especifico"],
        message: Mensagens.campo_obrigatorio,
      });
    }
  });
