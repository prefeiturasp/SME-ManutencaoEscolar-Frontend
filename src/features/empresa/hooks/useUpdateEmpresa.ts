import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atualizarEmpresa } from "../services/empresa.service";
import type { EmpresaFormValues } from "../types/empresa.types";

export function useUpdateEmpresa(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmpresaFormValues) =>
      atualizarEmpresa(uuid, payload),
    onSuccess: (resultado) => {
      if (!resultado.success) return;

      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      queryClient.invalidateQueries({ queryKey: ["empresa", uuid] });
    },
  });
}
