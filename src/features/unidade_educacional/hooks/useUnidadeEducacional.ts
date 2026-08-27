import { UnidadeEducacionalListParams } from "@/features/unidade_educacional/types/unidadesEducacionais.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  listarTodasUnidadesEducacionaisAction,
  listarUnidadesEducacionaisAction,
} from "../services/unidadeEducacional.service";

type UseUnidadeEducacionalOptions = {
  enabled?: boolean;
};

export function useUnidadeEducacional(
  params: UnidadeEducacionalListParams,
  options?: UseUnidadeEducacionalOptions,
) {
  return useQuery({
    queryKey: ["unidades", params],
    queryFn: () => listarUnidadesEducacionaisAction(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useTodasUnidadesEducacionais(
  diretoriaRegionalId?: string,
  tipoEscolaUuid?: string,
  options?: UseUnidadeEducacionalOptions,
) {
  return useQuery({
    queryKey: [
      "unidades", 
      "todas", 
      diretoriaRegionalId ?? null,
      tipoEscolaUuid ?? null,
    ],
    queryFn: () =>
      listarTodasUnidadesEducacionaisAction({
        diretoria_regional: diretoriaRegionalId || undefined,
        tipo_escola: tipoEscolaUuid || undefined,
      }),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}
