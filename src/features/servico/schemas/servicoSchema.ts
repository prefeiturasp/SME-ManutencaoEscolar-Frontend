import { Mensagens } from "@/constants/mensagens";
import { z } from "zod";

export const servicoSchema = z.object({
  nome: z.string().trim().min(1, { message: Mensagens.campo_obrigatorio }),
  status: z.preprocess(
    (value) => {
      if (value === "" || value === undefined) {
        return undefined;
      }
      return value === "true";
    },
    z
      .boolean()
      .optional()
      .refine((value) => value !== undefined, {
        message: "Status é obrigatório!",
      }),
  ),
});

export type ServiceFormData = z.infer<typeof servicoSchema>;
