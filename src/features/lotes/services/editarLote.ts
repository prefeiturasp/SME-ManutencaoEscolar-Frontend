"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type {
  CriarLoteResultado,
  LoteCriado,
} from "@/features/lotes/types/lotes.types";

import type { LoteFormData } from "../schemas/loteSchema";
import { obterResultadoErroLote } from "./obterResultadoErroLote";

type EditarLoteCredenciais = {
  uuid: string;
  dados: LoteFormData;
};

export async function editarLoteAction({
  uuid,
  dados,
}: EditarLoteCredenciais): Promise<CriarLoteResultado> {
  try {
    const lote = await requisicaoAutenticada<LoteCriado>({
      method: "PATCH",
      url: `/lotes/${uuid}/`,
      data: {
        ...dados,
        status: dados.status === "true",
      },
    });

    return {
      success: true,
      lote,
    };
  } catch (error) {
    return obterResultadoErroLote(error);
  }
}
