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
  try {
    const empresa = await requisicaoAutenticada<Empresa>({
      method: "POST",
      url: "/empresas",
      data: payload,
    });

    return { success: true, empresa };
  } catch (error) {
    return tratarErroEmpresa(error);
  }
}

export async function atualizarEmpresa(
  uuid: string,
  payload: EmpresaFormValues,
): Promise<EmpresaResultado> {
  try {
    const empresa = await requisicaoAutenticada<Empresa>({
      method: "PUT",
      url: `/empresas/${uuid}`,
      data: payload,
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
