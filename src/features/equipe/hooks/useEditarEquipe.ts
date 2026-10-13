"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EquipeFormData } from "../schema/equipeSchema";
import { editarEquipeAction } from "../services/editarEquipe.api";

export function useEditarEquipe(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: EquipeFormData) => editarEquipeAction({ uuid, dados }),
    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos salvando as informações...",
      },
    },
    onSuccess: async (resultado) => {
      if (!resultado.success) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["equipes"] }),
        queryClient.invalidateQueries({ queryKey: ["equipe", uuid] }),
      ]);
    },
  });
}
