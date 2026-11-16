"use client";

import { useQuery } from "@tanstack/react-query";
import { listarOpcoesSolicitacaoManutencaoAction } from "../services/opcoesSolicitacaoManutencao.api";
import type { OpcoesSolicitacaoManutencaoPorCampo } from "../types/solicitacaoManutencao.types";

export function useOpcoesSolicitacaoManutencao<
  Campo extends keyof OpcoesSolicitacaoManutencaoPorCampo,
>(campo: Campo) {
  return useQuery({
    queryKey: ["solicitacoes-manutencao", "opcoes", campo],
    queryFn: () => listarOpcoesSolicitacaoManutencaoAction(campo),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
