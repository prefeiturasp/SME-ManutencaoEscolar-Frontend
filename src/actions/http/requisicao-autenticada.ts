import "server-only";

import { type AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";

import { api } from "@/actions/http/client";

export async function requisicaoAutenticada<T>(
  configuracao: AxiosRequestConfig,
): Promise<T> {
  const armazenamentoCookies = await cookies();
  const tokenAcesso = armazenamentoCookies.get("accessToken")?.value;

  if (!tokenAcesso) {
    throw new Error("Usuário não autenticado.");
  }

  const resposta = await api.request<T>({
    ...configuracao,
    headers: {
      ...configuracao.headers,
      Authorization: `Bearer ${tokenAcesso}`,
    },
  });

  return resposta.data;
}
