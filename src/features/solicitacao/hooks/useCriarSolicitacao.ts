"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { criarSolicitacaoAction } from "../services/criarSolicitacao.api";

export function useCriarSolicitacao() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: criarSolicitacaoAction,
    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos cadastrando a solicitação...",
      },
    },
    onSuccess: async (resultado) => {
      if (!resultado.success) return;
      await queryClient.invalidateQueries({ queryKey: ["solicitacoes-manutencao"] });
      router.replace("/solicitacao");
    },
    onError: (error) => {
      console.error("Erro ao criar solicitação:", error);
    },
  });
}
