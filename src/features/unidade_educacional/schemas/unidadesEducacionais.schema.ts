import { ESTADOS_VALUES } from "@/constants/constants";
import { unmaskCep, unmaskTelefone } from "@/utils/formatadores";
import { z } from "zod";

export const unidadeEducacionalSchema = z.object({
  codigo_eol: z
    .string()
    .trim()
    .min(1, "CODESC é obrigatório!")
    .max(6),

  tipo_escola: z
    .string()
    .trim()
    .min(1, "Tipo de escola é obrigatório!"),

  diretoria_regional: z
    .string()
    .trim()
    .min(1, "Diretoria Regional é obrigatória!"),

  nome: z
    .string()
    .trim()
    .min(1, "Nome da unidade é obrigatório!")
    .max(300),

  subprefeitura: z
    .string()
    .trim()
    .min(1, "Subprefeitura é obrigatória!"),

  lote: z
    .string()
    .trim()
    .max(200),

  status: z
    .enum(["true", "false"], {
      message: "Status é obrigatório!",
    })
    .transform((value) => value === "true"),

  telefone: z
    .string()
    .trim()
    .transform((value) => unmaskTelefone(value))
    .refine(
    (value) =>
      value === "" || value.length === 10 || value.length === 11,
    "Telefone inválido!",
    ),

  email: z
    .string()
    .trim()
    .max(255)
    .refine(
      (value) => value === "" || z.regexes.email.test(value),
      "E-mail inválido!",
    ),

  cep: z
    .string()
    .min(1, "CEP é obrigatório!")
    .transform((value) => unmaskCep(value))
    .refine((value) => value.length === 8, "CEP deve conter 8 dígitos!")
    .refine((value) => /^\d{8}$/.test(value), {
      message: "CEP deve conter 8 dígitos!",
    }),

  logradouro: z
    .string()
    .trim()
    .max(255),

  numero: z
    .string()
    .trim()
    .max(10),

  bairro: z
    .string()
    .trim()
    .max(100),

  cidade: z
    .string()
    .trim()
    .max(100),

  estado: z
    .string()
    .trim()
    .refine(
      (value) =>
        ESTADOS_VALUES.includes(value as (typeof ESTADOS_VALUES)[number]),
      {
        message: "Estado inválido!",
      },
    ),
});

export type UnidadeEducacionalSchema =
  z.input<typeof unidadeEducacionalSchema>;

export type UnidadeEducacionalOutput =
  z.output<typeof unidadeEducacionalSchema>;