import { Mensagens } from "@/constants/mensagens";
import { z } from "zod";

const documentoCargoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, {
      message: Mensagens.campo_obrigatorio,
    })
    .max(255, {
      message: "O nome do documento deve ter no máximo 255 caracteres.",
    }),
});

export const cargoSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(1, {
        message: Mensagens.campo_obrigatorio,
      })
      .max(255, {
        message: "O nome do cargo deve ter no máximo 255 caracteres.",
      }),

    exige_documento: z
      .enum(["true", "false"])
      .optional()
      .refine((value) => value !== undefined, {
        message: "Informe se o cargo exige documento.",
      }),

    novo_documento: z
      .string()
      .trim()
      .max(255, {
        message: "O nome do documento deve ter no máximo 255 caracteres.",
      })
      .optional(),

    documentos: z.array(documentoCargoSchema).optional(),
  })
  .superRefine((dados, contexto) => {
    if (dados.exige_documento !== "true") {
      return;
    }

    const novoDocumento = dados.novo_documento?.trim() ?? "";
    const documentos = dados.documentos ?? [];

    const possuiDocumento = novoDocumento.length > 0 || documentos.length > 0;

    if (!possuiDocumento) {
      contexto.addIssue({
        code: "custom",
        path: ["novo_documento"],
        message: "Informe ao menos um documento para este cargo.",
      });
    }
  });

export type CargoFormData = z.infer<typeof cargoSchema>;
