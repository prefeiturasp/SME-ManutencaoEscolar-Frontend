"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listarSolicitacoesManutencaoAction } from "../services/listarSolicitacoesManutencao.api";
import type { SolicitacaoManutencaoListParams } from "../types/solicitacaoManutencao.types";

export function useSolicitacoesManutencao(params: SolicitacaoManutencaoListParams) {
  return useQuery({
    queryKey: ["solicitacoes-manutencao", params],
    queryFn: () => listarSolicitacoesManutencaoAction(params),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}
