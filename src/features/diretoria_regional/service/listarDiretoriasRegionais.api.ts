"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { RespostaDiretoriasRegionais } from "../types/diretoriasRegionais.types";

export async function listarDiretoriasRegionaisAction(): Promise<RespostaDiretoriasRegionais> {
  return requisicaoAutenticada<RespostaDiretoriasRegionais>({
    method: "GET",
    url: "/diretorias-regionais/",
    params: {
      page: 1,
      page_size: 100,
    },
  });
}
