import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fornecedorService } from "../services/fornecedor.service";
import type { FornecedorListParams } from "../types/fornecedor.types";

export function useFornecedores(params: FornecedorListParams) {
  return useQuery({
    queryKey: ["fornecedores", params],
    queryFn: () => fornecedorService.list(params),
    placeholderData: keepPreviousData,
  });
}
