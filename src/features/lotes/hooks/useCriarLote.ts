"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { criarLoteAction } from "@/features/lotes/services/criarLote.api";

export function useCriarLote() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: criarLoteAction,

    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos cadastrando o lote...",
      },
    },

    onSuccess: async (resultado) => {
      if (!resultado.success) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["lotes"],
      });

      router.replace("/lotes");
    },

    onError: (error) => {
      console.error("Erro ao criar lote:", error);
    },
  });
}
