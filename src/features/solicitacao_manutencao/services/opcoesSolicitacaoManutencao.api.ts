"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { Opcao } from "@/components/types/opcao.types";

export async function listarOpcoesSolicitacaoManutencaoAction(
  campo: "tipos_atendimento" | "fases" | "situacoes",
): Promise<Opcao[]> {
  const caminho = campo === "tipos_atendimento" ? "tipos-atendimento" : campo;
  return requisicaoAutenticada<Opcao[]>({
    method: "GET",
    url: `/solicitacoes-manutencao/${caminho}/`,
  });
}
