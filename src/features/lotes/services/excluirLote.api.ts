"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import axios from "axios";

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
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        status: error.response?.status ?? 404,
        title: error.response?.data?.title ?? "Erro",
        message:
          error.response?.data?.message ??
          error.response?.data?.detail ??
          "Não conseguimos excluir. Por favor, tente novamente.",
      };
    }
    return {
      success: false,
      status: 500,
      title: "Erro",
      message: "Ocorreu um erro inesperado ao excluir o serviço.",
    };
  }
}
