"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";

import type { FiltrosServico, Servico } from "../types/servicos.types";

export async function listarServicosAction(
  filtros: FiltrosServico = {},
): Promise<Servico[]> {
  return requisicaoAutenticada<Servico[]>({
    method: "GET",
    url: "/servicos/",
    params: filtros,
  });
}
