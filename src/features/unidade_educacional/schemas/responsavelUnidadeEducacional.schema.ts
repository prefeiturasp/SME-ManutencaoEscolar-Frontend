import { unmaskTelefone } from "@/utils/formatadores";
import { z } from "zod";

export const responsavelUnidadeEducacionalSchema = z.object({
  registro_funcional: z
    .string()
    .trim()
    .min(1, "Campo obrigatório!")
    .refine((value) => /^\d+$/.test(value), "RF ou CPF deve conter apenas números!")
    .refine(
      (value) => value.length === 7 || value.length === 11,
      "RF deve conter 7 dígitos ou CPF deve conter 11 dígitos!",
    ),

  nome: z.string().trim().min(1, "Campo obrigatório!").max(255),

  cargo: z.string().trim().min(1, "Campo obrigatório!"),

  email: z
    .string()
    .trim()
    .min(1, "Campo obrigatório!")
    .max(255)
    .refine((value) => value === "" || z.regexes.email.test(value), "E-mail inválido!"),

  telefone: z
    .string()
    .trim()
    .transform((value) => unmaskTelefone(value))
    .refine(
      (value) => value === "" || value.length === 10 || value.length === 11,
      "Telefone inválido!",
    ),

  celular: z
    .string()
    .trim()
    .transform((value) => unmaskTelefone(value))
    .refine(
      (value) => value === "" || value.length === 10 || value.length === 11,
      "Celular inválido!",
    ),

  uuid: z.string().optional(),
  criado_pelo_sincronizador: z.boolean(),
});

export const responsaveisUnidadeEducacionalSchema = z
  .array(responsavelUnidadeEducacionalSchema)
  .min(1, "É obrigatório informar pelo menos um responsável!");

export type ResponsavelUnidadeEducacionalSchema = z.input<
  typeof responsavelUnidadeEducacionalSchema
>;

export type ResponsavelUnidadeEducacionalOutput = z.output<
  typeof responsavelUnidadeEducacionalSchema
>;

export type ResponsaveisUnidadeEducacionalSchema = z.input<
  typeof responsaveisUnidadeEducacionalSchema
>;

export const RESPONSAVEL_UNIDADE_EDUCACIONAL_VAZIO: ResponsavelUnidadeEducacionalSchema = {
  registro_funcional: "",
  nome: "",
  cargo: "",
  email: "",
  telefone: "",
  celular: "",
  criado_pelo_sincronizador: false,
};
