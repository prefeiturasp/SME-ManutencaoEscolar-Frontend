"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { criarServicoAction } from "../services/servico.api";

export function useCriarServico() {
  const router = useRouter();

  return useMutation({
    mutationFn: criarServicoAction,

    onSuccess: (resultado) => {
      if (!resultado.success) {
        return;
      }

      router.replace("/cadastro/servicos");
    },

    onError: (error) => {
      console.error("Erro ao criar serviço:", error);
    },
  });
}
