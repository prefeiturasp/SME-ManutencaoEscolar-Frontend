import { z } from "zod";

export const informacoesAdicionaisSchema = z.object({
  informacoes_adicionais: z.string().trim().optional(),
});
