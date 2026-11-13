"use server";

import { api } from "@/actions/http/client";

export async function healthAction(): Promise<string> {
  try {
    const { data } = await api.get(`/health/`);

    if (typeof data.status === "string") {
      return data.status;
    }

    return JSON.stringify(data.status ?? data);
  } catch (error) {
    console.error("Erro ao buscar status da API:", error);
    return "indisponível";
  }
}
