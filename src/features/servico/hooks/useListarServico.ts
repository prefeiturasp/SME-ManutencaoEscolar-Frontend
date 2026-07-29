"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listarServicosAction } from "../services/buscar.api";
import type { FiltrosServico } from "../types/servicos.types";

export function useListarServicos(filtros: FiltrosServico) {
  return useQuery({
    queryKey: ["servicos", filtros.nome ?? "", filtros.status ?? "todos"],
    queryFn: () => listarServicosAction(filtros),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
