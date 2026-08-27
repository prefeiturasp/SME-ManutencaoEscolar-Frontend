"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { RespostaTipoUnidade, TipoUnidade, UnidadeTipoUnidadeListParams } from "../types/tipoUnidades.types";


export async function listarTiposUnidadeAction(
  filtros?: UnidadeTipoUnidadeListParams,
): Promise<RespostaTipoUnidade> {
  return requisicaoAutenticada<RespostaTipoUnidade>({
    method: "GET",
    url: "/tipos-escola/",
    params: filtros,
  });
}


export async function listarTodasTiposUnidadeAction(
  filtros?: Omit<UnidadeTipoUnidadeListParams, "page" | "page_size">,
): Promise<TipoUnidade[]> {
  return requisicaoAutenticada<TipoUnidade[]>({
    method: "GET",
    url: "/tipos-escola/",
    params: { ...filtros, page_size: "all" },
  });
}
