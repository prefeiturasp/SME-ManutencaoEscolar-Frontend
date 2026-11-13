import { z } from "zod";
import { Mensagens } from "@/constants/mensagens";
import { dadosSolicitacaoManutencaoSchema } from "./dadosSolicitacaoManutencaoSchema";
import { informacoesAdicionaisSchema } from "./informacoesAdicionaisSchema";
import { servicosManutencaoSchema } from "./servicosManutencaoSchema";

export { servicoManutencaoSchema } from "./adicionarServicoManutencaoSchema";

export const solicitacaoManutencaoSchema = z.object({
  unidade_educacional: z.string().trim().min(1, Mensagens.campo_obrigatorio),
  ...dadosSolicitacaoManutencaoSchema.shape,
  ...servicosManutencaoSchema.shape,
  ...informacoesAdicionaisSchema.shape,
});
