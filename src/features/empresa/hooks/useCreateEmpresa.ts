import { useMutation, useQueryClient } from "@tanstack/react-query";
import { empresaService } from "../services/empresa.service";
import type { EmpresaFormValues } from "../types/empresa.types";

export function useCreateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmpresaFormValues) => empresaService.create(payload),
    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos cadastrando a empresa...",
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
    },
  });
}
