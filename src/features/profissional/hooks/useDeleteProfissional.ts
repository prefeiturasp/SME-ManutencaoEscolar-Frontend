import { deletarProfissional } from "@/features/profissional/services/profissional.service";
import { type UseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ResultadoExclusao } from "@/utils/tratarErroExclusao";

export function useDeleteProfissional(
  uuid: string,
): UseMutationResult<ResultadoExclusao, Error, void> {
  const queryClient = useQueryClient();

  return useMutation<ResultadoExclusao, Error, void>({
    mutationFn: async () => {
      const resultado = await deletarProfissional(uuid);

      if (!resultado.success) {
        throw new Error(resultado.message);
      }

      return resultado;
    },
    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos excluindo o profissional...",
      },
    },
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: ["profissional", uuid],
        exact: true,
      });
      await queryClient.invalidateQueries({ queryKey: ["profissionais"] });
    },
  });
}
