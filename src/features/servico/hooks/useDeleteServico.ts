import { useMutation, useQueryClient } from "@tanstack/react-query";
import { excluirServico } from "../services/excluirServico.api";

export function useExcluirServico(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const resultado = await excluirServico(uuid);

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
        queryKey: ["servicos"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["servicos", uuid],
      });
    },
  });
}
