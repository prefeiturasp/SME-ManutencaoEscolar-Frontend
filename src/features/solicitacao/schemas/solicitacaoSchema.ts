import { z } from "zod";
import { Mensagens } from "@/constants/mensagens";
import { dadosSolicitacaoSchema } from "./dadosSolicitacaoSchema";
import { informacoesAdicionaisSchema } from "./informacoesAdicionaisSchema";
import { servicosManutencaoSchema } from "./servicosManutencaoSchema";

export { servicoManutencaoSchema } from "./adicionarServicoSchema";

export const solicitacaoSchema = z.object({
  unidade_educacional: z.string().trim().min(1, Mensagens.campo_obrigatorio),
  ...dadosSolicitacaoSchema.shape,
  ...servicosManutencaoSchema.shape,
  ...informacoesAdicionaisSchema.shape,
});
export type SolicitacaoFormData = z.infer<typeof solicitacaoSchema>;
