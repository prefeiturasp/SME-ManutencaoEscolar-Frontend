import { useMutation, useQueryClient } from "@tanstack/react-query";

import { excluirEquipe } from "../services/excluirEquipe.api";

export function useExcluirEquipe(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const resultado = await excluirEquipe(uuid);

      if (!resultado.success) {
        if (resultado.status === 400) {
          throw resultado;
        }

        throw new Error(resultado.message);
      }

      return resultado;
    },

    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos excluindo a equipe...",
      },
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["equipes"] }),
        queryClient.invalidateQueries({ queryKey: ["equipe", uuid] }),
      ]);
    },
  });
}
