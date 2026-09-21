"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CargoFormData } from "../schemas/cargoSchema";
import { editarCargoAction } from "../services/editarCargo.api";

export function useEditarCargo(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: CargoFormData) =>
      editarCargoAction({
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
        queryKey: ["cargos"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["cargo", uuid],
      });
    },
  });
}
