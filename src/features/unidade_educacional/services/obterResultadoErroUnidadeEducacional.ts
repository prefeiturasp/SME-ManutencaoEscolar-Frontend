import axios from "axios";

import type {
  AtualizarUnidadeEducacionalResultado,
  ErroApiUnidadeEducacional,
} from "../types/unidadesEducacionais.types";

function obterMensagemErro(dadosErro?: ErroApiUnidadeEducacional): string {
  if (!dadosErro) {
    return "Erro não identificado.";
  }

  if (typeof dadosErro.detail === "string") {
    return dadosErro.detail;
  }

  return (
    dadosErro.detail?.message ??
    dadosErro.message ??
    dadosErro.non_field_errors?.[0] ??
    "Erro não identificado."
  );
}

export function obterResultadoErroUnidadeEducacional(
  error: unknown,
): AtualizarUnidadeEducacionalResultado {
  if (!axios.isAxiosError(error)) {
    throw error;
  }

  const dadosErro = error.response?.data as
    | ErroApiUnidadeEducacional
    | undefined;

  return {
    success: false,
    error: "api-error",
    title: dadosErro?.title ?? "Não é possível adicionar o contato",
    message: obterMensagemErro(dadosErro),
    status: error.response?.status,
  };
}