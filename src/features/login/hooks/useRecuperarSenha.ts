"use client";

import { useMutation } from "@tanstack/react-query";

import { recuperarSenhaAction } from "../services/recuperarSenha.api";

export function useRecuperarSenha() {
  return useMutation({
    mutationFn: recuperarSenhaAction,

    onError: (error) => {
      console.error("Erro na mutation de recuperação de senha:", error);
    },
  });
}
