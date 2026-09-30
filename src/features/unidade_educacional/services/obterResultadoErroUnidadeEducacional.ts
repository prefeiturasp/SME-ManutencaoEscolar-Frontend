import axios from "axios";

import type {
  AtualizarUnidadeEducacionalResultado,
  ErroApiUnidadeEducacional,
} from "../types/unidadesEducacionais.types";

const mensagemErro = "Não conseguimos salvar as informações. Por favor, tente novamente.";
function obterMensagemErro(dadosErro?: ErroApiUnidadeEducacional): string {
  if (!dadosErro) {
    return mensagemErro;
  }

  if (typeof dadosErro.detail === "string") {
    return dadosErro.detail;
  }

  return dadosErro.message ?? mensagemErro;
}

export function obterResultadoErroUnidadeEducacional(
  error: unknown,
): AtualizarUnidadeEducacionalResultado {
  if (!axios.isAxiosError(error)) {
    throw error;
  }

  const dadosErro = error.response?.data as ErroApiUnidadeEducacional | undefined;

  return {
    success: false,
    error: "api-error",
    title: dadosErro?.title ?? "Erro",
    message: obterMensagemErro(dadosErro),
    status: error.response?.status,
  };
}
