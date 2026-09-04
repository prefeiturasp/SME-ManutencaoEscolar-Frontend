"use server";

import axios from "axios";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { obterMensagemErro } from "@/utils/erro";

import type {
  Empresa,
  EmpresaFormValues,
  EmpresaListParams,
  EmpresaResultado,
  RespostaEmpresas,
} from "../types/empresa.types";

function payloadFormData(payload: EmpresaFormValues): FormData {
  const formData = new FormData();

  const anexarValor = (chave: string, valor: unknown) => {
    if (
      typeof valor === "boolean" ||
      typeof valor === "number" ||
      (typeof valor === "string" && valor.length > 0)
    ) {
      formData.append(chave, String(valor));
    }
  };

  const { responsaveis_tecnicos, ...empresa } = payload;

  Object.entries(empresa).forEach(([chave, valor]) => {
    anexarValor(chave, valor);
  });

  responsaveis_tecnicos.forEach((responsavel, responsavelIndex) => {
    const { anexos, ...dadosResponsavel } = responsavel;
    const prefixo = `responsaveis_tecnicos[${responsavelIndex}]`;

    Object.entries(dadosResponsavel).forEach(([chave, valor]) => {
      anexarValor(`${prefixo}${chave}`, valor);
    });

    anexos?.forEach((anexo, anexoIndex) => {
      const prefixoArquivo = `${prefixo}arquivos[${anexoIndex}]`;

      if (anexo instanceof File) {
        formData.append(prefixoArquivo, anexo);
        return;
      }

      anexarValor(`${prefixoArquivo}uuid`, anexo.uuid);
    });
  });

  return formData;
}

function prepararPayload(payload: EmpresaFormValues): object | FormData {
  const possuiAnexo = payload.responsaveis_tecnicos.some((responsavel) =>
    Boolean(responsavel.anexos?.length),
  );

  if (possuiAnexo) return payloadFormData(payload);

  return {
    ...payload,
    responsaveis_tecnicos: payload.responsaveis_tecnicos.map(
      ({ anexos, ...responsavel }) => ({
        ...responsavel,
        arquivos: anexos ?? [],
      }),
    ),
  };
}

function tratarErroEmpresa(error: unknown): EmpresaResultado {
  if (!axios.isAxiosError(error)) {
    throw error;
  }

  const { titulo, descricao } = obterMensagemErro(error);

  return {
    success: false,
    error: "api-error",
    title: titulo,
    message: descricao,
    status: error.response?.status,
  };
}

export async function criarEmpresa(
  payload: EmpresaFormValues,
): Promise<EmpresaResultado> {
  return salvarEmpresa("POST", "/empresas", payload);
}

export async function atualizarEmpresa(
  uuid: string,
  payload: EmpresaFormValues,
): Promise<EmpresaResultado> {
  return salvarEmpresa("PUT", `/empresas/${uuid}`, payload);
}

async function salvarEmpresa(
  method: "POST" | "PUT",
  url: string,
  payload: EmpresaFormValues,
): Promise<EmpresaResultado> {
  try {
    const data = prepararPayload(payload);

    const empresa = await requisicaoAutenticada<Empresa>({
      method,
      url,
      data,
      headers:
        data instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : undefined,
    });

    return { success: true, empresa };
  } catch (error) {
    return tratarErroEmpresa(error);
  }
}

export async function listarEmpresas(
  params: EmpresaListParams,
): Promise<RespostaEmpresas> {
  return requisicaoAutenticada<RespostaEmpresas>({
    method: "GET",
    url: "/empresas",
    params,
  });
}

export async function buscarEmpresaPorUuid(uuid: string): Promise<Empresa> {
  return requisicaoAutenticada<Empresa>({
    method: "GET",
    url: `/empresas/${uuid}`,
  });
}

export async function deletarEmpresa(uuid: string): Promise<EmpresaResultado> {
  try {
    const empresa = await requisicaoAutenticada<Empresa>({
      method: "DELETE",
      url: `/empresas/${uuid}`,
    });

    return { success: true, empresa };
  } catch (error) {
    return tratarErroEmpresa(error);
  }
}
