"use client";

import { useQuery } from "@tanstack/react-query";
import { listarDiretoriasRegionaisAction } from "../service/listarDiretoriasRegionais.api";

export function useListarDiretoriasRegionais() {
  return useQuery({
    queryKey: ["diretorias-regionais"],
    queryFn: listarDiretoriasRegionaisAction,
    staleTime: 30_000,
  });
}
