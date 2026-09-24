import { z } from "zod";
import { unmaskCpf } from "@/utils/formatadores";

const documentoSchema = z.object({
  arquivo: z.array(z.instanceof(File)).min(1, "O documento é obrigatório!"),
});

const funcaoSchema = z.object({
  uuid_cargo: z.string().trim().min(1, "Função é obrigatória!"),
  documentos: z.array(documentoSchema).default([]),
});

export const profissionalSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório!").max(255),
  rg: z
    .string()
    .trim()
    .min(1, "RG é obrigatório!")
    .toUpperCase()
    .regex(/^[A-Z0-9]{7,9}$/, "RG inválido!"),
  cpf: z
    .string()
    .trim()
    .min(1, "CPF é obrigatório!")
    .transform(unmaskCpf)
    .refine((valor) => valor.length === 11, "CPF inválido!"),
  status: z
    .enum(["true", "false"])
    .optional()
    .refine((value) => value !== undefined, {
      message: "Status é obrigatório!",
    })
    .transform((value) => value === "true"),
  funcoes: z.array(funcaoSchema).min(1, "Adicione ao menos uma função!"),
});

export type ProfissionalSchema = z.input<typeof profissionalSchema>;
export type ProfissionalSchemaOutput = z.output<typeof profissionalSchema>;
