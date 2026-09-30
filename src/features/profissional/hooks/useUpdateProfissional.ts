import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atualizarProfissional } from "@/features/profissional/services/profissional.service";
import type { ProfissionalFormValues } from "@/features/profissional/types/profissional.types";
import { ProfissionalApiError } from "./useCreateProfissional";

export function useUpdateProfissional(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProfissionalFormValues) => {
      const resultado = await atualizarProfissional(uuid, payload);
      if (!resultado.success) {
        throw new ProfissionalApiError(resultado.message, resultado.fieldErrors);
      }
      return resultado;
    },
    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos atualizando o profissional...",
      },
    },
    onSuccess: (resultado) => {
      queryClient.invalidateQueries({ queryKey: ["profissionais"] });
      queryClient.invalidateQueries({ queryKey: ["profissional", uuid] });
    },
  });
}
