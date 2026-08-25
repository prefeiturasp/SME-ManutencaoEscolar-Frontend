import { UnidadeEducacionalListParams } from "@/features/unidade_educacional/types/unidadesEducacionais.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listarUnidadesEducacionaisAction } from "../services/unidadeEducacional.service";

export function useUnidadeEducacional(params: UnidadeEducacionalListParams) {
  return useQuery({
    queryKey: ["unidades", params],
    queryFn: () => listarUnidadesEducacionaisAction(params),
    placeholderData: keepPreviousData,
  });
}
