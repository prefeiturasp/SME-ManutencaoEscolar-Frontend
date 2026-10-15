"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";

import type { EquipeFormData } from "../schema/equipeSchema";
import type { CriarEquipeResultado, EquipeCriada, EquipePayload } from "../types/equipe.types";
import { obterResultadoErroEquipe } from "./obterResultadoErroEquipe";

export async function editarEquipeAction({
  uuid,
  dados,
}: {
  uuid: string;
  dados: Partial<EquipeFormData>;
}): Promise<CriarEquipeResultado> {
  try {
    const payload: Partial<EquipePayload> = {};

    if (dados.nome !== undefined) payload.nome = dados.nome.trim();
    if (dados.empresa !== undefined) payload.empresa = dados.empresa;
    if (dados.lote !== undefined) payload.lote = dados.lote;
    if (dados.situacao !== undefined) payload.situacao = dados.situacao === "true";
    if (dados.profissionais !== undefined) {
      payload.profissionais = dados.profissionais.map(({ profissional, funcao }) => ({
        profissional,
        funcao,
      }));
    }

    const equipe = await requisicaoAutenticada<EquipeCriada>({
      method: "PATCH",
      url: `/equipes/${uuid}/`,
      data: payload,
    });

    return {
      success: true,
      equipe,
    };
  } catch (error) {
    return obterResultadoErroEquipe(error);
  }
}
