import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { buscarEquipeAction } from "../services/buscarEquipe.api";
import { listarEquipesAction } from "../services/listarEquipes.api";
import type { EquipeListParams } from "../types/equipe.types";

export function useEquipes(params: EquipeListParams) {
  return useQuery({
    queryKey: ["equipes", params],
    queryFn: () => listarEquipesAction(params),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useEquipe(uuid: string) {
  return useQuery({
    queryKey: ["equipe", uuid],
    queryFn: () => buscarEquipeAction(uuid),
    enabled: Boolean(uuid),
    refetchOnWindowFocus: false,
  });
}
