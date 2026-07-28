import { z } from "zod";
import { ESTADOS_VALUES } from "@/constants";
import { unmaskCnpj, unmaskCep } from "@/utils/formatadores";

export const fornecedorSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório!").max(255),
  cnpj: z
    .string()
    .transform((value) => unmaskCnpj(value))
    .refine((value) => /^[A-Z0-9]{12}\d{2}$/.test(value), "CNPJ inválido!"),
  status: z.boolean().default(true),
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
    .refine((value) => !value || value.startsWith("https://"), {
      message: 'O link deve começar com "https://"!',
    }),
  cep: z
    .string()
    .transform((value) => unmaskCep(value))
    .refine((value) => /^\d{8}$/.test(value), {
      message: "CEP deve conter 8 dígitos!",
    }),
  logradouro: z.string().trim().min(1, "Logradouro é obrigatório!").max(255),
  numero: z.string().trim().min(1, "Número é obrigatório!").max(10),
  complemento: z.string().trim().max(255).optional().or(z.literal("")),
  cidade: z.string().trim().min(1, "Cidade é obrigatória!").max(100),
  estado: z.enum(ESTADOS_VALUES, { message: "Estado inválido!" }),
});

export type FornecedorSchema = z.infer<typeof fornecedorSchema>;
