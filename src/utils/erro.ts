import { isAxiosError } from "axios";

type ErroApi = {
  title?: string;
  detail?: string;
  nome?: string[];
  message?: string;
  [campo: string]: unknown;
};

type ErrorLike = {
  response?: {
    data?: ErroApi;
  };
};

function extrairMensagens(valor: unknown): string[] {
  if (Array.isArray(valor)) {
    return valor.filter(
      (item): item is string => typeof item === "string" && item.trim() !== "",
    );
  }

  if (typeof valor === "string" && valor.trim() !== "") {
    return [valor];
  }

  return [];
}

export function obterMensagemErro(error: unknown) {
  let dados: unknown;

  if (isAxiosError<ErroApi>(error)) {
    dados = error.response?.data;
  } else if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    dados = (error as ErrorLike).response?.data;
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
    "Falha no cadastro. Por favor, tente novamente.";

  return {
    titulo: dadosErro?.title ?? "Erro",
    descricao:
      typeof descricao === "string"
        ? descricao
        : "Falha no cadastro. Por favor, tente novamente.",
  };
}
