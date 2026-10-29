"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { criarSolicitacaoManutencaoAction } from "../services/criarSolicitacaoManutencao.api";

export function useCriarSolicitacaoManutencao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: criarSolicitacaoManutencaoAction,
    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos cadastrando a solicitação...",
      },
    },
    onSuccess: async (resultado) => {
      if (!resultado.success) return;
      await queryClient.invalidateQueries({ queryKey: ["solicitacoes-manutencao"] });
    },
    onError: (error) => {
      console.error("Erro ao criar solicitação:", error);
    },
  });
}
