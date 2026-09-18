import { z } from "zod";
import { emailSchema, telefoneSchema } from "./common.schema.";

export const responsavelUnidadeEducacionalSchema = z.object({
  registro_funcional: z
    .string()
    .trim()
    .min(1, "RF ou CPF é obrigatório!")
    .refine(
      (value) => /^\d+$/.test(value),
      "RF ou CPF deve conter apenas números!",
    )
    .refine(
      (value) => value.length === 7 || value.length === 11,
      "RF deve conter 7 dígitos ou CPF deve conter 11 dígitos!",
    ),

  nome: z
    .string()
    .trim()
    .min(1, "Nome completo é obrigatório!")
    .max(255),

  cargo: z
    .string()
    .trim()
    .min(1, "Cargo é obrigatório!"),

  email: emailSchema,

  telefone: telefoneSchema(),

  celular: telefoneSchema("Celular inválido!"),
});

export const responsaveisUnidadeEducacionalSchema = z
  .array(responsavelUnidadeEducacionalSchema)
  .min(1, "É obrigatório informar pelo menos um responsável!");

export type ResponsavelUnidadeEducacionalSchema =
  z.input<typeof responsavelUnidadeEducacionalSchema>;

export type ResponsavelUnidadeEducacionalOutput =
  z.output<typeof responsavelUnidadeEducacionalSchema>;

export type ResponsaveisUnidadeEducacionalSchema =
  z.input<typeof responsaveisUnidadeEducacionalSchema>;