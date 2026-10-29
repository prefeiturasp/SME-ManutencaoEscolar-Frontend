"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { Opcao } from "@/components/types/opcao.types";

export async function listarOpcoesSolicitacaoManutencaoAction(
  complemento_url: string,
): Promise<Opcao[]> {
  return requisicaoAutenticada<Opcao[]>({
    method: "GET",
    url: `/solicitacoes-manutencao/${complemento_url}/`,
  });
}
