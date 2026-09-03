"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";

import type { LoteFormData } from "@/features/lotes/schemas/loteSchema";
import type {
  CriarLoteResultado,
  LoteCriado,
} from "@/features/lotes/types/lotes.types";
import { obterResultadoErroLote } from "./obterResultadoErroLote";

export async function criarLoteAction(
  dados: LoteFormData,
): Promise<CriarLoteResultado> {
  try {
    const lote = await requisicaoAutenticada<LoteCriado>({
      method: "POST",
      url: "/lotes/",
      data: {
        codigo_cadastro: dados.codigo_cadastro.trim(),
        nome: dados.nome.trim(),
        empresa: dados.empresa,
        periodo_inicial: dados.periodo_inicial,
        periodo_final: dados.periodo_final,
        status: dados.status === "true",
        diretorias_regionais: dados.diretorias_regionais.map(Number),
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
