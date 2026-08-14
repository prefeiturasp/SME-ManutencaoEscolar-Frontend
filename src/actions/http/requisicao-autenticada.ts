import "server-only";

import axios, { type AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";

import { api } from "@/actions/http/client";
import { renovarAccessToken } from "./renovarAcessToken";

export async function requisicaoAutenticada<T>(
  configuracao: AxiosRequestConfig,
): Promise<T> {
  const cookieStore = await cookies();

  let tokenAcesso: string | null =
    cookieStore.get("accessToken")?.value ?? null;

  if (!tokenAcesso) {
    tokenAcesso = await renovarAccessToken();

    if (!tokenAcesso) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
  }

  const executarRequisicao = (token: string) =>
    api.request<T>({
      ...configuracao,
      headers: {
        ...configuracao.headers,
        Authorization: `Bearer ${token}`,
      },
    });

  try {
    const resposta = await executarRequisicao(tokenAcesso);

    return resposta.data;
  } catch (error) {
    const recebeuNaoAutorizado =
      axios.isAxiosError(error) && error.response?.status === 401;

    if (!recebeuNaoAutorizado) {
      throw error;
    }

    const novoTokenAcesso = await renovarAccessToken();

    if (!novoTokenAcesso) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const novaResposta = await executarRequisicao(novoTokenAcesso);

    return novaResposta.data;
  }
}
