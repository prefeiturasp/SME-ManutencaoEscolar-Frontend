"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { OpcoesSolicitacaoManutencaoPorCampo } from "../types/solicitacaoManutencao.types";

export async function listarOpcoesSolicitacaoManutencaoAction<
  Campo extends keyof OpcoesSolicitacaoManutencaoPorCampo,
>(complemento_url: Campo): Promise<OpcoesSolicitacaoManutencaoPorCampo[Campo]> {
  return requisicaoAutenticada<OpcoesSolicitacaoManutencaoPorCampo[Campo]>({
    method: "GET",
    url: `/solicitacoes-manutencao/${complemento_url}/`,
  });
}
