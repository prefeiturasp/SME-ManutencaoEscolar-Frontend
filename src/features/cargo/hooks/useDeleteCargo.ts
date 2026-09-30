import { useMutation, useQueryClient } from "@tanstack/react-query";
import { excluirCargo } from "../services/excluirCargo.api";

export function useExcluirCargo(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const resultado = await excluirCargo(uuid);

      if (!resultado.success) {
        throw new Error(resultado.message);
      }

      return resultado;
    },

    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos excluindo o cargo...",
      },
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cargos"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["cargos", uuid],
      });
    },
  });
}
