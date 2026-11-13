"use client";

import { useMutation } from "@tanstack/react-query";

import { alterarSenhaAction } from "../services/redefinirSenha";

export function useAlterarSenha() {
  return useMutation({
    mutationFn: alterarSenhaAction,

    onError: (error) => {
      console.error("Erro na mutation de alteração de senha:", error);
    },
  });
}
