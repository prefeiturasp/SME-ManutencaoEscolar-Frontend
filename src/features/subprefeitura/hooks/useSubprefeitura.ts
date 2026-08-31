import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SubprefeituraListParams } from "../types/subprefeitura.types";
import { listarSubprefeiturasAction, listarTodasSubprefeiturasAction } from "../service/subprefeitura.service";


type UseTipoUnidadeOptions = {
  enabled?: boolean;
};

export function useSubprefeituras(
  params: SubprefeituraListParams,
  options?: UseTipoUnidadeOptions,
) {
  return useQuery({
    queryKey: ["subprefeituras", params],
    queryFn: () => listarSubprefeiturasAction(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useTodosSubprefeituras(
  diretoriaRegionalId?: string,
  options?: UseTipoUnidadeOptions,
) {
  return useQuery({
    queryKey: [
      "subprefeituras", 
      "todos", 
      diretoriaRegionalId ?? null
    ],
    queryFn: () => listarTodasSubprefeiturasAction({
      diretoria_regional: diretoriaRegionalId || undefined,
    }),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}
