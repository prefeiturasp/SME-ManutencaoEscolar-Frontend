import axios from "axios";
import type { CriarEquipeResultado, ErroApi } from "../types/equipe.types";

function obterMensagemErro(dadosErro?: ErroApi): string {
  if (!dadosErro) {
    return "Erro não identificado.";
  }

  if (typeof dadosErro.detail === "string") {
    return dadosErro.detail;
  }

  const erroProfissional = dadosErro.profissionais
    ?.map((erro) =>
      typeof erro === "string"
        ? erro
        : (erro.profissional?.[0] ?? erro.funcao?.[0] ?? erro.non_field_errors?.[0]),
    )
    .find(Boolean);

  return (
    dadosErro.detail?.message ??
    dadosErro.message ??
    dadosErro.nome?.[0] ??
    dadosErro.status?.[0] ??
    dadosErro.situacao?.[0] ??
    dadosErro.empresa?.[0] ??
    dadosErro.lote?.[0] ??
    erroProfissional ??
    dadosErro.non_field_errors?.[0] ??
    "Erro não identificado."
  );
}

export function obterResultadoErroEquipe(error: unknown): CriarEquipeResultado {
  if (!axios.isAxiosError(error)) {
    throw error;
  }

  const dadosErro = error.response?.data as ErroApi | undefined;

  return {
    success: false,
    error: "api-error",
    title: dadosErro?.title ?? "Erro",
    message: obterMensagemErro(dadosErro),
    status: error.response?.status,
  };
}
