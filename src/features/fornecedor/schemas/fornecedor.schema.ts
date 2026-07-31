import { z } from "zod";
import { unmaskCnpj, unmaskCep } from "@/utils/formatadores";
import { ESTADOS_VALUES } from "@/constants";

export const fornecedorSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório!").max(255),
  cnpj: z
    .string()
    .trim()
    .min(1, "CNPJ é obrigatório!")
    .transform((value) => unmaskCnpj(value))
    .refine((value) => value.length === 14, "CNPJ deve conter 14 dígitos!")
    .refine((value) => /^[A-Z0-9]{12}\d{2}$/.test(value), "CNPJ inválido!"),
  status: z
    .enum(["true", "false"])
    .optional()
    .refine((value) => value !== undefined, {
      message: "Status é obrigatório!",
    })
    .transform((value) => value === "true"),
  razao_social: z
    .string()
    .trim()
    .min(1, "Razão social é obrigatória!")
    .max(255),
  link_rastreio: z
    .string()
    .trim()
    .max(255)
    .optional()
    .or(z.literal(""))
    .refine(
      (value) =>
        !value || value.startsWith("http://") || value.startsWith("https://"),
      {
        message: 'O endereço deve começar com "http://" ou "https://".',
      },
    ),
  cep: z
    .string()
    .min(1, "CEP é obrigatório!")
    .transform((value) => unmaskCep(value))
    .refine((value) => value.length === 8, "CEP deve conter 8 dígitos!")
    .refine((value) => /^\d{8}$/.test(value), {
      message: "CEP deve conter 8 dígitos!",
    }),
  logradouro: z.string().trim().min(1, "Logradouro é obrigatório!").max(255),
  numero: z.string().trim().min(1, "Número é obrigatório!").max(10),
  complemento: z.string().trim().max(255).optional().or(z.literal("")),
  cidade: z.string().trim().min(1, "Cidade é obrigatória!").max(100),
  estado: z
    .string()
    .trim()
    .min(1, "Estado é obrigatório!")
    .refine(
      (value) =>
        ESTADOS_VALUES.includes(value as (typeof ESTADOS_VALUES)[number]),
      {
        message: "Estado inválido!",
      },
    ),
});

export type FornecedorSchema = z.input<typeof fornecedorSchema>;
export type FornecedorSchemaOutput = z.output<typeof fornecedorSchema>;
