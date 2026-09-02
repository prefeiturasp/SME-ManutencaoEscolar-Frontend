import {
  buscarLoteAction,
  listarLotesAction,
} from "@/features/lotes/services/buscarLotes.api";
import { LoteListParams } from "@/features/lotes/types/lotes.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useLotes(params: LoteListParams) {
  return useQuery({
    queryKey: ["lotes", params],
    queryFn: () => listarLotesAction(params),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useBuscarLotePorUuid(uuid: string) {
  return useQuery({
    queryKey: ["lote", uuid],
    queryFn: () => buscarLoteAction(uuid),
    enabled: Boolean(uuid),
    refetchOnWindowFocus: false,
  });
}
