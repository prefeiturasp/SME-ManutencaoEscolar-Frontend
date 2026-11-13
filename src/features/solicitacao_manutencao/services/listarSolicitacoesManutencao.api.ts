"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type {
  RespostaSolicitacoesManutencao,
  SolicitacaoManutencaoListParams,
} from "../types/solicitacaoManutencao.types";

export async function listarSolicitacoesManutencaoAction(
  params: SolicitacaoManutencaoListParams,
): Promise<RespostaSolicitacoesManutencao> {
  return requisicaoAutenticada<RespostaSolicitacoesManutencao>({
    method: "GET",
    url: "/solicitacoes-manutencao/",
    params,
  });
}
