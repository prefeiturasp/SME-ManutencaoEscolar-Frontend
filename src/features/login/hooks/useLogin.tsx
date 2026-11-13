"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { loginAction } from "../services/login.api";

export function useLogin() {
  const router = useRouter();

  const definirUsuario = useUsuarioStore((estado) => estado.definirUsuario);

  return useMutation({
    mutationFn: loginAction,

    onSuccess: (resultado) => {
      if (!resultado.success) {
        return;
      }

      definirUsuario(resultado.user);

      router.replace("/");
    },

    onError: (error) => {
      console.error("Erro na mutation de login:", error);
    },
  });
}
