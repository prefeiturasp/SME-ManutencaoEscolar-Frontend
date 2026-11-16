import { z } from "zod";
import { unmaskCpf } from "@/utils/formatadores";

const TAMANHO_MAXIMO_ARQUIVO = 2 * 1024 * 1024;
const TAMANHO_MAXIMO_TOTAL_ARQUIVOS = 10 * 1024 * 1024;
const EXTENSOES_ARQUIVO_PERMITIDAS = new Set([".jpeg", ".jpg", ".png"]);

const arquivoSchema = z.array(z.instanceof(File)).superRefine((arquivos, ctx) => {
  arquivos.forEach((arquivo) => {
    if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO) {
      ctx.addIssue({
        code: "custom",
        message: "O arquivo não pode ser maior que 2 MB!",
      });
    }

    const extensao = arquivo.name.slice(arquivo.name.lastIndexOf(".")).toLowerCase();
    if (!EXTENSOES_ARQUIVO_PERMITIDAS.has(extensao)) {
      ctx.addIssue({
        code: "custom",
        message: "Formato de arquivo inválido! Formatos permitidos: PNG, JPG e JPEG.",
      });
    }
  });
});

const documentoSchema = z
  .object({
    uuid: z.string().trim().optional(),
    nome_documento: z.string().trim().optional(),
    nome_original: z.string().trim().optional(),
    arquivo_url: z.string().trim().optional(),
    arquivo: arquivoSchema.optional(),
  })
  .refine((documento) => Boolean(documento.uuid || documento.arquivo?.length), {
    message: "O documento é obrigatório!",
    path: ["arquivo"],
  });

const funcaoSchema = z.object({
  uuid: z.string().trim().optional(),
  uuid_cargo: z.string().trim().min(1, "Função é obrigatória!"),
  documentos: z.array(documentoSchema).default([]),
});

export const profissionalSchema = z
  .object({
    nome: z.string().trim().min(1, "Nome é obrigatório!").max(255),
    rg: z
      .string()
      .trim()
      .min(1, "RG é obrigatório!")
      .toUpperCase()
      .regex(/^[A-Z0-9]{7,20}$/, "RG inválido!"),
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
  })
  .superRefine((profissional, ctx) => {
    const arquivos = profissional.funcoes.flatMap((funcao, indiceFuncao) =>
      funcao.documentos.flatMap((documento, indiceDocumento) =>
        (documento.arquivo ?? []).map((arquivo) => ({ arquivo, indiceFuncao, indiceDocumento })),
      ),
    );

    const tamanhoTotal = arquivos.reduce((total, item) => total + item.arquivo.size, 0);
    if (tamanhoTotal <= TAMANHO_MAXIMO_TOTAL_ARQUIVOS) return;

    arquivos.forEach(({ indiceFuncao, indiceDocumento }) => {
      ctx.addIssue({
        code: "custom",
        message: "A soma dos arquivos não pode ultrapassar 10 MB!",
        path: ["funcoes", indiceFuncao, "documentos", indiceDocumento, "arquivo"],
      });
    });
  });

export type ProfissionalSchema = z.input<typeof profissionalSchema>;
export type ProfissionalSchemaOutput = z.output<typeof profissionalSchema>;
