import { useMutation, useQueryClient } from "@tanstack/react-query";
import { excluirLote } from "../services/excluirLote.api";

export function useExcluirLote(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const resultado = await excluirLote(uuid);

      if (!resultado.success) {
        throw new Error(resultado.message);
      }

      return resultado;
    },

    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos excluindo o serviço...",
      },
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["lotes"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["lotes", uuid],
      });
    },
  });
}
