import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { empresaService } from "../services/empresa.service";
import type { EmpresaListParams } from "../types/empresa.types";

export function useEmpresas(params: EmpresaListParams) {
  return useQuery({
    queryKey: ["empresas", params],
    queryFn: () => empresaService.list(params),
    placeholderData: keepPreviousData,
  });
}
