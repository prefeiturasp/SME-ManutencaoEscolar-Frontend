"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";

import type {
  FiltrosServico,
  RespostaServicos,
  Servico,
} from "../types/servicos.types";

export async function listarServicosAction(
  filtros?: FiltrosServico,
): Promise<RespostaServicos> {
  return requisicaoAutenticada<RespostaServicos>({
    method: "GET",
    url: "/servicos/",
    params: filtros,
  });
}

export async function buscarServicoAction(uuid: string): Promise<Servico> {
  return requisicaoAutenticada<Servico>({
    method: "GET",
    url: `/servicos/${uuid}/`,
  });
}
