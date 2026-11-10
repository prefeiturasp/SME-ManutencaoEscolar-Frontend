"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { Opcao } from "@/components/types/opcao.types";
import { SITUACOES_POR_FASE } from "../constants/situacoesPorFase";

export async function listarOpcoesSolicitacaoManutencaoAction(
  complemento_url: string,
): Promise<Opcao[]> {
  const opcoes = await requisicaoAutenticada<Opcao[]>({
    method: "GET",
    url: `/solicitacoes-manutencao/${complemento_url}/`,
  });
  if (complemento_url !== "situacoes") return opcoes;

  const valoresRecebidos = new Set(opcoes.map((opcao) => opcao.value));
  const complementares = [...SITUACOES_POR_FASE.vistoria, ...SITUACOES_POR_FASE.execucao];
  return [...opcoes, ...complementares.filter((opcao) => !valoresRecebidos.has(opcao.value))];
}
