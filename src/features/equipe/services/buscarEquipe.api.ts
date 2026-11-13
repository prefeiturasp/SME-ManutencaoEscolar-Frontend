"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { EquipeDetalhe } from "../types/equipe.types";

export async function buscarEquipeAction(uuid: string): Promise<EquipeDetalhe> {
  return requisicaoAutenticada<EquipeDetalhe>({
    method: "GET",
    url: `/equipes/${uuid}/`,
  });
}
