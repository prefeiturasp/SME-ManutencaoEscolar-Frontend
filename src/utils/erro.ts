import { isAxiosError } from "axios";

type ErroApi = {
  title?: string;
  detail?: string | { message?: string };
  nome?: string[];
  message?: string | { message?: string; vinculados?: string[] };
  status?: number;
  [campo: string]: unknown;
};

type ErrorLike = {
  response?: {
    status?: number;
    data?: ErroApi;
  };
};

function extrairMensagens(valor: unknown): string[] {
  if (Array.isArray(valor)) {
    return valor.flatMap(extrairMensagens);
  }

  if (typeof valor === "string" && valor.trim() !== "") {
    return [valor];
  }

  if (typeof valor === "object" && valor !== null) {
    return Object.values(valor).flatMap(extrairMensagens);
  }

  return [];
}

export function obterMensagemErro(
  error: unknown,
  mensagemPadrao = "Falha ao salvar. Por favor, tente novamente.",
) {
  let dados: unknown;
  let status: number | undefined;

  if (isAxiosError<ErroApi>(error)) {
    dados = error.response?.data;
    status = error.response?.status;
  } else if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as ErrorLike).response;

    dados = response?.data;
    status = response?.status;
  } else {
    dados = error;
  }

  const dadosErro: ErroApi | undefined =
    typeof dados === "object" && dados !== null && !Array.isArray(dados)
      ? (dados as ErroApi)
      : undefined;

  const mensagens = Object.values(dadosErro ?? {}).flatMap(extrairMensagens);

  const descricao =
    extrairMensagens(dadosErro?.detail)[0] ??
    dadosErro?.nome?.[0] ??
    extrairMensagens(dadosErro?.message)[0] ??
    mensagens[0] ??
    mensagemPadrao;

  return {
    titulo: dadosErro?.title ?? "Erro",
    descricao,
    status: status ?? dadosErro?.status,
  };
}
