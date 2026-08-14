import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listarEmpresas } from "../services/empresa.service";
import type { EmpresaListParams } from "../types/empresa.types";

export function useEmpresas(params: EmpresaListParams) {
  return useQuery({
    queryKey: ["empresas", params],
    queryFn: () => listarEmpresas(params),
    placeholderData: keepPreviousData,
  });
}
