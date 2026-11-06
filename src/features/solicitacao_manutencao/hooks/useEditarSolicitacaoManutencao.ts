"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editarSolicitacaoManutencaoAction } from "../services/editarSolicitacaoManutencao.api";

export function useEditarSolicitacaoManutencao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editarSolicitacaoManutencaoAction,
    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos atualizando a solicitação...",
      },
    },
    onSuccess: async (resultado) => {
      if (!resultado.success) return;
      await queryClient.invalidateQueries({ queryKey: ["solicitacoes-manutencao"] });
    },
    onError: (error) => {
      console.error("Erro ao editar solicitação:", error);
    },
  });
}
