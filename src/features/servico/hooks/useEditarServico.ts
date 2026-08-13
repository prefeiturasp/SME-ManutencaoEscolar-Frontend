"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ServiceFormData } from "../schemas/servicoSchema";
import { editarServicoAction } from "../services/editarServico";

export function useEditarServico(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: ServiceFormData) =>
      editarServicoAction({
        uuid,
        dados,
      }),

    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos salvando as informações...",
      },
    },

    onSuccess: async (resultado) => {
      if (!resultado.success) return;

      await queryClient.invalidateQueries({
        queryKey: ["servicos"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["servico", uuid],
      });
    },
  });
}
