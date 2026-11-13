import { z } from "zod";
import { Mensagens } from "@/constants/mensagens";

export const dadosSolicitacaoManutencaoSchema = z.object({
  tipo_atendimento: z
    .string({ error: Mensagens.campo_obrigatorio })
    .trim()
    .min(1, Mensagens.campo_obrigatorio),
});
