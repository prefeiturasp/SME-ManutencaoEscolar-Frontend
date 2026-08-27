import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listarTiposUnidadeAction, listarTodasTiposUnidadeAction } from "../service/tipoUnidade.service";
import { TipoUnidadeListParams } from "../types/tipoUnidades.types";

type UseTipoUnidadeOptions = {
  enabled?: boolean;
};

export function useTiposUnidades(
  params: TipoUnidadeListParams,
  options?: UseTipoUnidadeOptions,
) {
  return useQuery({
    queryKey: ["tipos-unidade", params],
    queryFn: () => listarTiposUnidadeAction(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useTodosTiposUnidades(
  params?: TipoUnidadeListParams,
  options?: UseTipoUnidadeOptions,
) {
  return useQuery({
    queryKey: ["tipos-unidade", "todos", params],
    queryFn: () => listarTodasTiposUnidadeAction(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}
