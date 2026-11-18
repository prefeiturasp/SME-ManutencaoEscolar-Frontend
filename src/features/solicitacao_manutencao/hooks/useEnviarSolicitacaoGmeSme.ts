"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enviarSolicitacaoGmeSmeAction } from "../services/enviarSolicitacaoGmeSme.api";

export function useEnviarSolicitacaoGmeSme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enviarSolicitacaoGmeSmeAction,
    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos enviando a solicitação para GME/SME...",
      },
    },
    onSuccess: async (resultado) => {
      if (!resultado.success) return;
      await queryClient.invalidateQueries({
        queryKey: ["solicitacoes-manutencao"],
        refetchType: "none",
      });
    },
    onError: (error) => {
      console.error("Erro ao enviar solicitação para GME/SME:", error);
    },
  });
}
