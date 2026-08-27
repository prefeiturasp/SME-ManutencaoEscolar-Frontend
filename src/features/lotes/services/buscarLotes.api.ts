"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import {
  Lote,
  LoteListParams,
  RespostaLotes,
} from "@/features/lotes/types/lotes.types";

export async function listarLotesAction(
  filtros?: LoteListParams,
): Promise<RespostaLotes> {
  return requisicaoAutenticada<RespostaLotes>({
    method: "GET",
    url: "/lotes/",
    params: filtros,
  });
}

export async function buscarLoteAction(uuid: string): Promise<Lote> {
  return requisicaoAutenticada<Lote>({
    method: "GET",
    url: `/lotes/${uuid}/`,
  });
}
