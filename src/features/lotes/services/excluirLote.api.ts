"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import {
  ResultadoExclusao,
  tratarErroExclusao,
} from "@/utils/tratarErroExclusao";

export async function excluirLote(uuid: string): Promise<ResultadoExclusao> {
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
