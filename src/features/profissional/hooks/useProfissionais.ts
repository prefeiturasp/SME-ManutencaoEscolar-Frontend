import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listarProfissionais } from "../services/profissional.service";
import type { ProfissionalListParams } from "../types/profissional.types";

export function useProfissionais(params: ProfissionalListParams) {
  return useQuery({
    queryKey: ["profissionais", params],
    queryFn: () => listarProfissionais(params),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}
