import axios from "axios";
import type { CriarEquipeResultado, ErroApi } from "../types/equipe.types";

function obterPrimeiraMensagem(erro: unknown): string | undefined {
  if (typeof erro === "string") return erro || undefined;
  if (Array.isArray(erro)) {
    return erro.map(obterPrimeiraMensagem).find(Boolean);
  }
  if (erro !== null && typeof erro === "object") {
    return Object.values(erro).map(obterPrimeiraMensagem).find(Boolean);
  }
  return undefined;
}

function obterMensagemErro(dadosErro?: ErroApi): string {
  if (!dadosErro) {
    return "Erro não identificado.";
  }

  if (typeof dadosErro.detail === "string") {
    return dadosErro.detail;
  }

  const erroProfissional = obterPrimeiraMensagem(dadosErro.profissionais);

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
  const detalhe = typeof dadosErro?.detail === "object" ? dadosErro.detail : undefined;
  const vinculados = dadosErro?.vinculados ?? detalhe?.vinculados;

  return {
    success: false,
    error: "api-error",
    title: dadosErro?.title ?? "Erro",
    message: obterMensagemErro(dadosErro),
    status: error.response?.status,
    ...(Array.isArray(vinculados) ? { vinculados } : {}),
  };
}
