import "server-only";

import { type AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";

import { api } from "@/actions/http/client";

export async function requisicaoAutenticada<T>(
  configuracao: AxiosRequestConfig,
): Promise<T> {
  const armazenamentoCookies = await cookies();
  const accessToken = armazenamentoCookies.get("accessToken")?.value;

  if (!accessToken) {
    throw new Error("Usuário não autenticado.");
  }
  console.log("Chamando endpoint:", configuracao.url);
  console.log("Token encontrado:", accessToken);

  const resposta = await api.request<T>({
    ...configuracao,
    headers: {
      ...configuracao.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return resposta.data;
}
