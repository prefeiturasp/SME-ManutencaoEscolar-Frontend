"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { LoteFormData } from "../schemas/loteSchema";
import { editarLoteAction } from "../services/editarLote";

export function useEditarLote(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: LoteFormData) =>
      editarLoteAction({
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
        queryKey: ["lotes"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["lote", uuid],
      });
    },
  });
}
