import { z } from "zod";
import { Mensagens } from "@/constants/mensagens";

export const dadosSolicitacaoSchema = z.object({
  tipo_atendimento: z.enum(["comum", "urgente"], { error: Mensagens.campo_obrigatorio }),
});
