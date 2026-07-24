import { z } from "zod";

export const servicoSchema = z.object({
  service_name: z.string().trim().min(1, "Informe o nome do serviço"),

  status: z.enum(["ativo", "inativo"], {
    message: "Selecione o status",
  }),
});

export type ServiceFormData = z.infer<typeof servicoSchema>;
