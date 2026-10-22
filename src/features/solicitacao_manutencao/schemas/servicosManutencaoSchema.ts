import { z } from "zod";
import { servicoManutencaoSchema } from "./adicionarServicoManutencaoSchema";

export const servicosManutencaoSchema = z.object({
  servicos: z.array(servicoManutencaoSchema).min(1, "Adicione pelo menos um serviço."),
});
