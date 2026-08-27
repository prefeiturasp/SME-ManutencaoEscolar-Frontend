import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listarTiposUnidadeAction, listarTodasTiposUnidadeAction } from "../service/tipoUnidade.service";
import { UnidadeTipoUnidadeListParams } from "../types/tipoUnidades.types";

type UseTipoUnidadeOptions = {
  enabled?: boolean;
};

export function useTiposUnidades(
  params: UnidadeTipoUnidadeListParams,
  options?: UseTipoUnidadeOptions,
) {
  return useQuery({
    queryKey: ["unidades", params],
    queryFn: () => listarTiposUnidadeAction(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useTodosTiposUnidades(
  params?: UnidadeTipoUnidadeListParams,
  options?: UseTipoUnidadeOptions,
) {
  return useQuery({
    queryKey: ["unidades", "todas", params],
    queryFn: () => listarTodasTiposUnidadeAction(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}
