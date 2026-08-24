"use server";

import axios from "axios";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";

import type { LoteFormData } from "@/features/lotes/schemas/loteSchema";
import type {
  CriarLoteResultado,
  ErroApi,
  LoteCriado,
} from "@/features/lotes/types/lotes.types";

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

export async function criarLoteAction(
  dados: LoteFormData,
): Promise<CriarLoteResultado> {
  try {
    const lote = await requisicaoAutenticada<LoteCriado>({
      method: "POST",
      url: "/lotes/",
      data: {
        codigo_cadastro: dados.codigo_cadastro.trim(),
        nome: dados.nome.trim(),
        empresa: dados.empresa,
        periodo_inicial: dados.periodo_inicial,
        periodo_final: dados.periodo_final,
        status: dados.status === "true",
        diretorias_regionais: dados.diretorias_regionais.map(Number),
      },
    });

    return {
      success: true,
      lote,
    };
  } catch (error) {
    if (axios.isAxiosError<ErroApi>(error)) {
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
