"use server";

import axios from "axios";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";

import type { ServiceFormData } from "../schemas/servicoSchema";
import type { CriarServicoResultado } from "../types/servicos.types";

type ErroApi = {
  title?: string;
  detail?: string;
  nome?: string[];
  message?: string;
};

export async function criarServicoAction(
  dados: ServiceFormData,
): Promise<CriarServicoResultado> {
  try {
    const service = await requisicaoAutenticada<{
      id: number;
      uuid: string;
      nome: string;
      status: boolean;
    }>({
      method: "POST",
      url: "/servicos/",
      data: {
        nome: dados.nome,
        status: dados.status === "true",
      },
    });

    return {
      success: true,
      service,
    };
  } catch (error) {
    if (axios.isAxiosError<ErroApi>(error)) {
      const dadosErro = error.response?.data;

      const titulo = dadosErro?.title ?? "Erro";

      const mensagem =
        dadosErro?.detail ??
        dadosErro?.nome?.[0] ??
        dadosErro?.message ??
        "Erro não identificado.";

      return {
        success: false,
        error: "api-error",
        title: titulo,
        message: mensagem,
        status: error.response?.status,
      };
    }

    throw error;
  }
}
