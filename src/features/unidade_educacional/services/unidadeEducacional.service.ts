"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { RespostaUnidadeEducacional, UnidadeEducacionalListParams } from "@/features/unidade_educacional/types/unidadesEducacionais.types";



export async function listarUnidadesEducacionaisAction(
  filtros?: UnidadeEducacionalListParams,
): Promise<RespostaUnidadeEducacional> {
  return requisicaoAutenticada<RespostaUnidadeEducacional>({
    method: "GET",
    url: "/unidades-educacionais/",
    params: filtros,
  });
}