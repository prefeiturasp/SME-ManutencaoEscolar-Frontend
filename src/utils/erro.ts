import { isAxiosError } from "axios";

type ErroApi = {
  title?: string;
  detail?: string;
  nome?: string[];
  message?: string;
  status?: number;
  [campo: string]: unknown;
};

type ErrorLike = {
  response?: {
    data?: ErroApi;
    status?: number;
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
    dadosErro?.detail ??
    dadosErro?.nome?.[0] ??
    dadosErro?.message ??
    mensagens[0] ??
    mensagemPadrao;

  return {
    titulo: dadosErro?.title ?? "Erro",
    descricao,
    status: status ?? dadosErro?.status,
  };
}
