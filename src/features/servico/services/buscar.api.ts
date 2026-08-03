"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";

import type { FiltrosServico, RespostaServicos } from "../types/servicos.types";

export async function listarServicosAction(
  filtros?: FiltrosServico,
): Promise<RespostaServicos> {
  return requisicaoAutenticada<RespostaServicos>({
    method: "GET",
    url: "/servicos/",
    params: filtros,
  });
}
