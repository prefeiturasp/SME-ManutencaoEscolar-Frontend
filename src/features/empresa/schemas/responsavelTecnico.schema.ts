import { z } from "zod";
import { unmaskTelefone } from "@/utils/formatadores";
import {
  TIPO_RESPONSAVEL_TECNICO_VALUES,
  TIPOS_ENGENHEIRO_RESPONSAVEL_TECNICO,
} from "@/features/empresa/constants/empresa.constants";
import { anexoSchema } from "./anexo.schema";

export const responsavelTecnicoSchema = z
  .object({
    uuid: z.string().trim().optional().or(z.literal("")),
    tipo: z
      .string()
      .trim()
      .min(1, "Tipo é obrigatório!")
      .refine(
        (value) =>
          TIPO_RESPONSAVEL_TECNICO_VALUES.includes(
            value as (typeof TIPO_RESPONSAVEL_TECNICO_VALUES)[number],
          ),
        { message: "Tipo inválido!" },
      ),
    nome: z.string().trim().min(1, "Nome completo é obrigatório!").max(255),
    telefone: z
      .string()
      .trim()
      .min(1, "Telefone é obrigatório!")
      .transform((value) => unmaskTelefone(value))
      .refine(
        (value) =>
          value.length === 0 || value.length === 10 || value.length === 11,
        "Telefone inválido!",
      ),
    email: z
      .string()
      .trim()
      .min(1, "E-mail é obrigatório!")
      .max(255)
      .regex(z.regexes.email, "E-mail inválido!"),
    numero_crea: z.string().trim().max(20).optional().or(z.literal("")),
    numero_art: z.string().trim().max(20).optional().or(z.literal("")),
    anexos: z.array(z.union([z.instanceof(File), anexoSchema])).optional(),
  })
  .superRefine((data, ctx) => {
    const ehEngenheiro = TIPOS_ENGENHEIRO_RESPONSAVEL_TECNICO.includes(
      data.tipo as (typeof TIPOS_ENGENHEIRO_RESPONSAVEL_TECNICO)[number],
    );

    if (!ehEngenheiro) {
      return;
    }

    if (!data.numero_crea) {
      ctx.addIssue({
        code: "custom",
        path: ["numero_crea"],
        message: "Número do CREA-SP é obrigatório!",
      });
    }

    if (!data.numero_art) {
      ctx.addIssue({
        code: "custom",
        path: ["numero_art"],
        message: "Número da ART é obrigatório!",
      });
    }

    if (!data.anexos?.length) {
      ctx.addIssue({
        code: "custom",
        path: ["anexos"],
        message: "Ao menos um anexo é obrigatório!",
      });
    }
  });

export type ResponsavelTecnicoSchema = z.input<typeof responsavelTecnicoSchema>;
export type ResponsavelTecnicoSchemaOutput = z.output<
  typeof responsavelTecnicoSchema
>;

export const RESPONSAVEL_TECNICO_VAZIO: ResponsavelTecnicoSchema = {
  tipo: "",
  nome: "",
  telefone: "",
  email: "",
  numero_crea: "",
  numero_art: "",
  anexos: [],
};
