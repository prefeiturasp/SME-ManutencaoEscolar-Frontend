import { useMutation, useQueryClient } from "@tanstack/react-query";
import { excluirLote } from "../services/excluirLote.api";

export function useExcluirLote(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const resultado = await excluirLote(uuid);

      if (!resultado.success) {
        if (resultado.status === 400 || resultado.status === 409) {
          throw resultado;
        }
        throw new Error(
          typeof resultado.message === "string"
            ? resultado.message
            : "Não conseguimos excluir o lote. Por favor, tente novamente.",
        );
      }

      return resultado;
    },

    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos excluindo o lote...",
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
