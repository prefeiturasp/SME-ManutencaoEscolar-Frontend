"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  buscarServicoAction,
  listarServicosAction,
} from "../services/buscar.api";
import type { FiltrosServico } from "../types/servicos.types";

export function useListarServicos(filtros: FiltrosServico) {
  return useQuery({
    queryKey: [
      "servicos",
      filtros.nome ?? "",
      filtros.status ?? "todos",
      filtros.page ?? 1,
      filtros.page_size ?? 10,
    ],
    queryFn: () => listarServicosAction(filtros),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useBuscarServicoPorUuid(uuid: string) {
  return useQuery({
    queryKey: ["servico", uuid],
    queryFn: () => buscarServicoAction(uuid),
    enabled: Boolean(uuid),
    refetchOnWindowFocus: false,
  });
}
