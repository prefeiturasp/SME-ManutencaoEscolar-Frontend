"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { tratarErroExclusao } from "@/utils/tratarErroExclusao";
import type { ResultadoExclusaoLote } from "../types/lotes.types";

export async function excluirLote(uuid: string): Promise<ResultadoExclusaoLote> {
  try {
    await requisicaoAutenticada({
      method: "DELETE",
      url: `/lotes/${uuid}/`,
    });
    return {
      success: true,
    };
  } catch (error: unknown) {
    return tratarErroExclusao(error, "o lote");
  }
}
