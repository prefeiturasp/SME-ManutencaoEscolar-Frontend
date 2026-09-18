import { unmaskTelefone } from "@/utils/formatadores";
import z from "zod";

export const telefoneSchema = (mensagem = "Telefone inválido!") => z
    .string()
    .trim()
    .transform((value) => unmaskTelefone(value))
      .refine(
      (value) =>
        value === "" || value.length === 10 || value.length === 11,
      mensagem,
      );

export const emailSchema = z
    .string()
    .trim()
    .max(255)
    .refine(
      (value) => value === "" || z.regexes.email.test(value),
      "E-mail inválido!",
    );