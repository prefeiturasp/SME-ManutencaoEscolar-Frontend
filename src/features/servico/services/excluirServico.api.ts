"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { tratarErroExclusao } from "@/utils/tratarErroExclusao";
import { ResultadoEditarServico } from "./editarServico";

export async function excluirServico(
  uuid: string,
): Promise<ResultadoEditarServico> {
  try {
    await requisicaoAutenticada({
      method: "DELETE",
      url: `/servicos/${uuid}/`,
    });
    return {
      success: true,
    };
  } catch (error: unknown) {
    return tratarErroExclusao(error, "o serviço");
  }
}
