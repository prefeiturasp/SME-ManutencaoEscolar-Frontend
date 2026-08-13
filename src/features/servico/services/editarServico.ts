"use server";

import axios from "axios";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";

import type { ServiceFormData } from "../schemas/servicoSchema";

export type ResultadoEditarServico =
  | {
      success: true;
    }
  | {
      success: false;
      status: number;
      title: string;
      message: string;
    };

type EditarServicoCredenciais = {
  uuid: string;
  dados: ServiceFormData;
};

export async function editarServicoAction({
  uuid,
  dados,
}: EditarServicoCredenciais): Promise<ResultadoEditarServico> {
  try {
    await requisicaoAutenticada({
      method: "PATCH",
      url: `/servicos/${uuid}/`,
      data: {
        nome: dados.nome,
        status: dados.status === "true",
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        status: error.response?.status ?? 500,
        title: error.response?.data?.title ?? "Erro",
        message:
          error.response?.data?.message ??
          "Não conseguimos salvar as alterações. Por favor, tente novamente.",
      };
    }

    return {
      success: false,
      status: 500,
      title: "Erro",
      message: "Ocorreu um erro inesperado ao editar o serviço.",
    };
  }
}
