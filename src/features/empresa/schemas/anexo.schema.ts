import { z } from "zod";

export const anexoSchema = z.object({
  uuid: z.string().trim().optional(),
  nome: z.string().trim().min(1, "Nome do arquivo é obrigatório!").max(255),
  arquivo_url: z.url().optional(),
  anexado_por: z.string().trim().max(255).optional(),
  anexado_em: z.string().trim().optional(),
});

export type AnexoSchema = z.infer<typeof anexoSchema>;
