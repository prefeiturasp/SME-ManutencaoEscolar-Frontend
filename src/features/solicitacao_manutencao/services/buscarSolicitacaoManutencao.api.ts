"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { SolicitacaoManutencaoDetalhe } from "../types/solicitacaoManutencao.types";

export async function buscarSolicitacaoManutencaoAction(uuid: string) {
  return requisicaoAutenticada<SolicitacaoManutencaoDetalhe>({
    method: "GET",
    url: `/solicitacoes-manutencao/${encodeURIComponent(uuid)}/`,
  });
}
