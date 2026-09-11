import axios from "axios";

import type {
  CriarCargoResultado,
  ErroApiCargo,
  ErroDocumentoCargo,
} from "../types/cargos.types";

function obterMensagemErroDocumento(
  documentos?: string[] | ErroDocumentoCargo[],
): string | undefined {
  const primeiroErro = documentos?.[0];

  if (typeof primeiroErro === "string") {
    return primeiroErro;
  }

  return primeiroErro?.nome?.[0];
}

function obterMensagemErro(dadosErro?: ErroApiCargo): string {
  if (!dadosErro) {
    return "Erro não identificado.";
  }

  if (typeof dadosErro.detail === "string") {
    return dadosErro.detail;
  }

  if (
    dadosErro.detail &&
    typeof dadosErro.detail === "object" &&
    dadosErro.detail.message
  ) {
    return dadosErro.detail.message;
  }

  return (
    dadosErro.message ??
    dadosErro.nome?.[0] ??
    dadosErro.exige_documento?.[0] ??
    dadosErro.status?.[0] ??
    obterMensagemErroDocumento(dadosErro.documentos) ??
    dadosErro.non_field_errors?.[0] ??
    "Erro não identificado."
  );
}

export function obterResultadoErroCargo(error: unknown): CriarCargoResultado {
  if (!axios.isAxiosError(error)) {
    throw error;
  }

  const dadosErro = error.response?.data as ErroApiCargo | undefined;

  return {
    success: false,
    error: "api-error",
    title: dadosErro?.title ?? "Erro",
    message: obterMensagemErro(dadosErro),
    status: error.response?.status,
  };
}
