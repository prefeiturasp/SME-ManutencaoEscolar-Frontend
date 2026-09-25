"use server";

import axios from "axios";
import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { obterMensagemErro } from "@/utils/erro";
import type {
  Profissional,
  ProfissionalFormValues,
  ProfissionalResultado,
  ProfissionalListParams,
  RespostaProfissionais,
} from "../types/profissional.types";

function criarFormData(payload: ProfissionalFormValues): FormData {
  const formData = new FormData();
  const { funcoes, ...profissional } = payload;

  Object.entries(profissional).forEach(([chave, valor]) => {
    formData.append(chave, String(valor));
  });

  funcoes.forEach((funcao, index) => {
    const prefixo = `funcoes[${index}]`;
    formData.append(`${prefixo}uuid_cargo`, funcao.uuid_cargo);
    funcao.documentos.forEach((documento, documentoIndex) => {
      formData.append(`${prefixo}documentos[${documentoIndex}]arquivo`, documento.arquivo[0]);
    });
  });
  return formData;
}

function obterErrosDeCampos(data: unknown): { cpf?: string; rg?: string } {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return {};
  const resposta = data as Record<string, unknown>;
  const detalhes =
    typeof resposta.detail === "object" &&
    resposta.detail !== null &&
    !Array.isArray(resposta.detail)
      ? (resposta.detail as Record<string, unknown>)
      : resposta;
  const erros: { cpf?: string; rg?: string } = {};

  for (const campo of ["cpf", "rg"] as const) {
    const valor = detalhes[campo];
    const mensagem = Array.isArray(valor) ? valor[0] : valor;
    if (typeof mensagem === "string" && mensagem.trim()) erros[campo] = mensagem;
  }

  return erros;
}

export async function criarProfissional(
  payload: ProfissionalFormValues,
): Promise<ProfissionalResultado> {
  try {
    const possuiArquivos = payload.funcoes.some((funcao) => funcao.documentos.length > 0);
    const profissional = await requisicaoAutenticada<Profissional>({
      method: "POST",
      url: "/profissionais",
      data: possuiArquivos ? criarFormData(payload) : payload,
      headers: possuiArquivos ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return { success: true, profissional };
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;
    console.error("Erro da API ao cadastrar profissional:", {
      status: error.response?.status,
      resposta: error.response?.data,
    });
    const mensagem = obterMensagemErro(error);
    return {
      success: false,
      error: "api-error",
      title: mensagem.titulo,
      message: mensagem.descricao,
      status: error.response?.status,
      fieldErrors: obterErrosDeCampos(error.response?.data),
    };
  }
}

export async function listarProfissionais(
  params: ProfissionalListParams,
): Promise<RespostaProfissionais> {
  return requisicaoAutenticada<RespostaProfissionais>({
    method: "GET",
    url: "/profissionais",
    params,
  });
}
