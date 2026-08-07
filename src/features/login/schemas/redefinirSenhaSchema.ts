import { z } from "zod";

export const regrasSenha = {
  temMaiuscula: (senha: string) => /[A-Z]/.test(senha),
  temMinuscula: (senha: string) => /[a-z]/.test(senha),
  tamanhoValido: (senha: string) => senha.length >= 8 && senha.length <= 12,
  temNumero: (senha: string) => /\d/.test(senha),
  temEspecial: (senha: string) => /[#@&!?._]/.test(senha),
  semEspacos: (senha: string) => !/\s/.test(senha),
  semAcentos: (senha: string) =>
    !/[\u0300-\u036f]/.test(senha.normalize("NFD")),
};

export const redefinirSenhaSchema = z
  .object({
    novaSenha: z
      .string()
      .min(1, "Informe a nova senha.")
      .refine(regrasSenha.temMaiuscula, {
        message: "A senha deve possuir uma letra maiúscula.",
      })
      .refine(regrasSenha.temMinuscula, {
        message: "A senha deve possuir uma letra minúscula.",
      })
      .refine(regrasSenha.tamanhoValido, {
        message: "A senha deve possuir entre 8 e 12 caracteres.",
      })
      .refine(regrasSenha.temNumero, {
        message: "A senha deve possuir um número.",
      })
      .refine(regrasSenha.temEspecial, {
        message: "A senha deve possuir um caractere especial.",
      })
      .refine(regrasSenha.semEspacos, {
        message: "A senha não pode possuir espaços.",
      })
      .refine(regrasSenha.semAcentos, {
        message: "A senha não pode possuir caracteres acentuados.",
      }),

    confirmacaoSenha: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((dados) => dados.novaSenha === dados.confirmacaoSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmacaoSenha"],
  });

export type RedefinirSenhaFormData = z.infer<typeof redefinirSenhaSchema>;
