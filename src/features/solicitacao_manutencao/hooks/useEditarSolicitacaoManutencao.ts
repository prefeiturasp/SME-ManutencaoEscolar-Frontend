"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  editarSolicitacaoManutencaoAction,
  editarEEnviarSolicitacaoManutencaoAction,
} from "../services/editarSolicitacaoManutencao.api";
import type { EditarSolicitacaoManutencaoParams } from "../types/solicitacaoManutencao.types";
import { prepararServicosEdicao } from "../utils/prepararServicosEdicao";

export function useEditarSolicitacaoManutencao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enviar, ...dados }: EditarSolicitacaoManutencaoParams) => {
      const payload = { ...dados, servicos: prepararServicosEdicao(dados.servicos) };
      return enviar
        ? editarEEnviarSolicitacaoManutencaoAction(payload)
        : editarSolicitacaoManutencaoAction(payload);
    },
    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos atualizando a solicitação...",
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
      console.error("Erro ao editar solicitação:", error);
    },
  });
}
