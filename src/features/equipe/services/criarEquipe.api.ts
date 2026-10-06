"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";

import type { EquipeFormData } from "../schema/equipeSchema";
import type { CriarEquipeResultado, EquipeCriada, EquipePayload } from "../types/equipe.types";
import { obterResultadoErroEquipe } from "./obterResultadoErroEquipe";

export async function criarEquipeAction(dados: EquipeFormData): Promise<CriarEquipeResultado> {
  try {
    const payload: EquipePayload = {
      nome: dados.nome.trim(),
      empresa: dados.empresa,
      lote: dados.lote,
      status: dados.situacao === "true",
      profissionais: dados.profissionais.map(({ profissional, funcao }) => ({
        profissional,
        funcao,
      })),
    };

    const equipe = await requisicaoAutenticada<EquipeCriada>({
      method: "POST",
      url: "/equipes/",
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
