import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fornecedorService } from "../services/fornecedor.service";
import type { FornecedorFormValues } from "../types/fornecedorTypes";

export function useCreateFornecedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FornecedorFormValues) =>
      fornecedorService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
    },
  });
}
