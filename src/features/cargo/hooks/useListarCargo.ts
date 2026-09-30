"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  buscarCargoAction,
  listarCargosAction,
} from "../services/buscarCargo.api";
import { FiltrosCargos } from "../types/cargos.types";

export function useListarCargos(filtros: FiltrosCargos) {
  return useQuery({
    queryKey: [
      "cargos",
      filtros.nome ?? "",
      filtros.exige_documento ?? "todos",
      filtros.page ?? 1,
      filtros.page_size ?? 10,
    ],
    queryFn: () => listarCargosAction(filtros),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useBuscarCargoPorUuid(uuid: string) {
  return useQuery({
    queryKey: ["cargo", uuid],
    queryFn: () => buscarCargoAction(uuid),
    enabled: Boolean(uuid),
    refetchOnWindowFocus: false,
  });
}
