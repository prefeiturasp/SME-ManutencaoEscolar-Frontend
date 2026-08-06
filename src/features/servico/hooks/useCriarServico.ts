"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { criarServicoAction } from "../services/servico.api";

export function useCriarServico() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: criarServicoAction,

    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos cadastrando o serviço...",
      },
    },

    onSuccess: async (resultado) => {
      if (!resultado.success) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["servicos"],
      });

      router.replace("/cadastro/servicos");
    },

    onError: (error) => {
      console.error("Erro ao criar serviço:", error);
    },
  });
}
