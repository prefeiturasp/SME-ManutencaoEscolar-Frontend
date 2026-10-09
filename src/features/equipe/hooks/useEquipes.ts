import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
