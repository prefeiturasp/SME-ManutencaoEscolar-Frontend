"use server";

import axios from "axios";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";

import type {
  CriarLoteResultado,
  ErroApi,
  LoteCriado,
} from "@/features/lotes/types/lotes.types";
import { LoteFormData } from "../schemas/loteSchema";

function obterMensagemErro(dadosErro?: ErroApi): string {
  if (!dadosErro) {
    return "Erro não identificado.";
  }

  if (typeof dadosErro.detail === "string") {
    return dadosErro.detail;
  }

  return (
    dadosErro.detail?.message ??
    dadosErro.message ??
    dadosErro.codigo_cadastro?.[0] ??
    dadosErro.nome?.[0] ??
    dadosErro.empresa?.[0] ??
    dadosErro.periodo_inicial?.[0] ??
    dadosErro.periodo_final?.[0] ??
    dadosErro.diretorias_regionais?.[0] ??
    dadosErro.non_field_errors?.[0] ??
    "Erro não identificado."
  );
}

type EditarLoteCredenciais = {
  uuid: string;
  dados: LoteFormData;
};

export async function editarLoteAction({
  uuid,
  dados,
}: EditarLoteCredenciais): Promise<CriarLoteResultado> {
  try {
    const lote = await requisicaoAutenticada<LoteCriado>({
      method: "PATCH",
      url: `/lotes/${uuid}/`,
      data: {
        nome: dados.nome,
        status: dados.status === "true",
        codigo_cadastro: dados.codigo_cadastro,
        empresa: dados.empresa,
        periodo_inicial: dados.periodo_inicial,
        periodo_final: dados.periodo_final,
        diretorias_regionais: dados.diretorias_regionais,
      },
    });

    return {
      success: true,
      lote,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const dadosErro = error.response?.data;

      const detalhe =
        typeof dadosErro?.detail === "object" ? dadosErro.detail : undefined;

      return {
        success: false,
        error: "api-error",
        title: dadosErro?.title ?? "Erro",
        message: obterMensagemErro(dadosErro),
        vinculados: detalhe?.vinculados ?? [],
        status: error.response?.status,
      };
    }
    throw error;
  }
}
