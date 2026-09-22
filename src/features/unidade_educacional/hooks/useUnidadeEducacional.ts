import { useMutation, useQuery } from "@tanstack/react-query";
import { atualizarUnidadeEducacional, buscarUnidadeEducacionalPorUuid } from "../services/unidadeEducacional.service";
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
  return useMutation({
    mutationFn: (payload: AtualizarUnidadeEducacionalPayload) =>
      atualizarUnidadeEducacional(uuid, payload),
  });
}