"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { criarCargo } from "../services/criarCargo.api";

export function useCriarCargo() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: criarCargo,

    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos cadastrando o cargo...",
      },
    },

    onSuccess: async (resultado) => {
      if (!resultado.success) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["cargos"],
      });

      router.replace("/cargos");
    },

    onError: (error) => {
      console.error("Erro ao criar cargo:", error);
    },
  });
}
