"use server";

import axios from "axios";
import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { obterMensagemErro } from "@/utils/erro";
import type {
  ProfissionalDetalhe,
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
    if (funcao.uuid) formData.append(`${prefixo}uuid`, funcao.uuid);
    formData.append(`${prefixo}uuid_cargo`, funcao.uuid_cargo);
    funcao.documentos.forEach((documento, documentoIndex) => {
      const prefixoDocumento = `${prefixo}documentos[${documentoIndex}]`;
      if (documento.arquivo?.[0]) {
        formData.append(`${prefixoDocumento}arquivo`, documento.arquivo[0]);
      } else if (documento.uuid) {
        formData.append(`${prefixoDocumento}uuid`, documento.uuid);
      }
    });
  });
  return formData;
}

function prepararPayloadJson(payload: ProfissionalFormValues): ProfissionalFormValues {
  return {
    ...payload,
    funcoes: payload.funcoes.map((funcao) => ({
      ...(funcao.uuid ? { uuid: funcao.uuid } : {}),
      uuid_cargo: funcao.uuid_cargo,
      documentos: funcao.documentos.map((documento) =>
        documento.uuid ? { uuid: documento.uuid } : documento,
      ),
    })),
  };
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

async function salvarProfissional(
  method: "POST" | "PUT",
  url: string,
  payload: ProfissionalFormValues,
): Promise<ProfissionalResultado> {
  try {
    const possuiArquivos = payload.funcoes.some((funcao) =>
      funcao.documentos.some((documento) => Boolean(documento.arquivo?.length)),
    );
    const profissional = await requisicaoAutenticada<ProfissionalDetalhe>({
      method,
      url,
      data: possuiArquivos ? criarFormData(payload) : prepararPayloadJson(payload),
      headers: possuiArquivos ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return { success: true, profissional };
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;
    const operacao = method === "POST" ? "cadastrar" : "editar";
    console.error(`Erro da API ao ${operacao} profissional:`, {
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

export async function criarProfissional(
  payload: ProfissionalFormValues,
): Promise<ProfissionalResultado> {
  return salvarProfissional("POST", "/profissionais", payload);
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

export async function buscarProfissionalPorUuid(uuid: string): Promise<ProfissionalDetalhe> {
  return requisicaoAutenticada<ProfissionalDetalhe>({
    method: "GET",
    url: `/profissionais/${uuid}`,
  });
}

export async function atualizarProfissional(
  uuid: string,
  payload: ProfissionalFormValues,
): Promise<ProfissionalResultado> {
  return salvarProfissional("PUT", `/profissionais/${uuid}`, payload);
}
