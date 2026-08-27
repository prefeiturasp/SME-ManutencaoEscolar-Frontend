"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { RespostaSubprefeitura, Subprefeitura, SubprefeituraListParams } from "../types/subprefeitura.types";



export async function listarSubprefeiturasAction(
  filtros?: SubprefeituraListParams,
): Promise<RespostaSubprefeitura> {
  return requisicaoAutenticada<RespostaSubprefeitura>({
    method: "GET",
    url: "/subprefeituras/",
    params: filtros,
  });
}


export async function listarTodasSubprefeiturasAction(
  filtros?: Omit<SubprefeituraListParams, "page" | "page_size">,
): Promise<Subprefeitura[]> {
  return requisicaoAutenticada<Subprefeitura[]>({
    method: "GET",
    url: "/subprefeituras/",
    params: { ...filtros, page_size: "all" },
  });
}
