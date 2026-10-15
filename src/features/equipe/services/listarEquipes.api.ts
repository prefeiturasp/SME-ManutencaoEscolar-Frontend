"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { EquipeListParams, RespostaEquipes } from "../types/equipe.types";

export async function listarEquipesAction(filtros: EquipeListParams): Promise<RespostaEquipes> {
  return requisicaoAutenticada<RespostaEquipes>({
    method: "GET",
    url: "/equipes/",
    params: filtros,
  });
}
