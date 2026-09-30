"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import {
  AtualizarUnidadeEducacionalPayload,
  AtualizarUnidadeEducacionalResultado,
  RespostaUnidadeEducacional,
  UnidadeEducacional,
  UnidadeEducacionalListParams,
} from "@/features/unidade_educacional/types/unidadesEducacionais.types";
import { obterResultadoErroUnidadeEducacional } from "./obterResultadoErroUnidadeEducacional";

export async function listarUnidadesEducacionaisAction(
  filtros?: UnidadeEducacionalListParams,
): Promise<RespostaUnidadeEducacional> {
  return requisicaoAutenticada<RespostaUnidadeEducacional>({
    method: "GET",
    url: "/unidades-educacionais/",
    params: filtros,
  });
}

export async function listarTodasUnidadesEducacionaisAction(
  filtros?: Omit<UnidadeEducacionalListParams, "page" | "page_size">,
): Promise<UnidadeEducacional[]> {
  const resposta = await requisicaoAutenticada<RespostaUnidadeEducacional>({
    method: "GET",
    url: "/unidades-educacionais/",
    params: { ...filtros, page_size: "all" },
  });

  return resposta.results;
}

export async function buscarUnidadeEducacionalPorUuid(uuid: string): Promise<UnidadeEducacional> {
  return requisicaoAutenticada<UnidadeEducacional>({
    method: "GET",
    url: `/unidades-educacionais/${uuid}`,
  });
}

export async function atualizarUnidadeEducacional(
  uuid: string,
  payload: AtualizarUnidadeEducacionalPayload,
): Promise<AtualizarUnidadeEducacionalResultado> {
  try {
    await requisicaoAutenticada({
      method: "PUT",
      url: `/unidades-educacionais/${uuid}/`,
      data: payload,
    });

    return {
      success: true,
    };
  } catch (error) {
    return obterResultadoErroUnidadeEducacional(error);
  }
}
