import { z } from "zod";
import { Mensagens } from "@/constants/mensagens";

export const dadosSolicitacaoSchema = z.object({
  tipoAtendimento: z.enum(["comum", "urgente"], { error: Mensagens.campo_obrigatorio }),
});
export type TipoAtendimento = z.infer<typeof dadosSolicitacaoSchema>["tipoAtendimento"];
