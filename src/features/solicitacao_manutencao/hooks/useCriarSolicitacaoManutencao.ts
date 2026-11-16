"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  criarEEnviarSolicitacaoManutencaoAction,
  criarSolicitacaoManutencaoAction,
} from "../services/criarSolicitacaoManutencao.api";
import type { CriarSolicitacaoManutencaoParams } from "../types/solicitacaoManutencao.types";

export function useCriarSolicitacaoManutencao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enviar, ...dados }: CriarSolicitacaoManutencaoParams) =>
      enviar
        ? criarEEnviarSolicitacaoManutencaoAction(dados)
        : criarSolicitacaoManutencaoAction(dados),
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
