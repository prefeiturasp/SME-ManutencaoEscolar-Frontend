"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { criarEquipeAction } from "../services/criarEquipe.api";

export function useCriarEquipe() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: criarEquipeAction,

    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos cadastrando a equipe...",
      },
    },

    onSuccess: async (resultado) => {
      if (!resultado.success) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["equipes"],
      });

      router.replace("/empresas/equipes");
    },

    onError: (error) => {
      console.error("Erro ao criar equipe:", error);
    },
  });
}
