import { z } from "zod";

export const informacoesAdicionaisSchema = z.object({
  informacoesAdicionais: z.string().trim().optional(),
});
