import axios from "axios";

import type { CriarLoteResultado, ErroApi } from "../types/lotes.types";

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

export function obterResultadoErroLote(error: unknown): CriarLoteResultado {
  if (!axios.isAxiosError(error)) {
    throw error;
  }

  const dadosErro = error.response?.data as ErroApi | undefined;

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
