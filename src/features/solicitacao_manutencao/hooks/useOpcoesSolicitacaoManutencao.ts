"use client";

import { useQuery } from "@tanstack/react-query";
import { listarOpcoesSolicitacaoManutencaoAction } from "../services/opcoesSolicitacaoManutencao.api";

export function useOpcoesSolicitacaoManutencao(campo: "tipos_atendimento" | "fases" | "situacoes") {
  return useQuery({
    queryKey: ["solicitacoes-manutencao", "opcoes", campo],
    queryFn: () => listarOpcoesSolicitacaoManutencaoAction(campo),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
