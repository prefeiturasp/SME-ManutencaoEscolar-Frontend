"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { tratarErroExclusao } from "@/utils/tratarErroExclusao";

export type ResultadoLote =
  | {
      success: true;
    }
  | {
      success: false;
      status: number;
      title: string;
      message: string;
    };

export async function excluirLote(uuid: string): Promise<ResultadoLote> {
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
