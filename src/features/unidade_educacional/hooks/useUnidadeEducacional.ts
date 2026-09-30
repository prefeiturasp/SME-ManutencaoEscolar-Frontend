import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  atualizarUnidadeEducacional,
  buscarUnidadeEducacionalPorUuid,
} from "../services/unidadeEducacional.service";
import { AtualizarUnidadeEducacionalPayload } from "../types/unidadesEducacionais.types";

export function useUnidadeEducacional(uuid: string) {
  return useQuery({
    queryKey: ["unidade", uuid],
    queryFn: () => buscarUnidadeEducacionalPorUuid(uuid),
    enabled: Boolean(uuid),
    refetchOnWindowFocus: false,
  });
}

export function useAtualizarUnidadeEducacional(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AtualizarUnidadeEducacionalPayload) =>
      atualizarUnidadeEducacional(uuid, payload),
    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos salvando as informações...",
      },
    },

    onSuccess: async (resultado) => {
      if (!resultado.success) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["unidades"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["unidade", uuid],
      });
    },
  });
}
