import { useMutation, useQueryClient } from "@tanstack/react-query";
import { criarEmpresa } from "../services/empresa.service";
import type { EmpresaFormValues } from "../types/empresa.types";

export function useCreateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmpresaFormValues) => criarEmpresa(payload),
    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos cadastrando a empresa...",
      },
    },
    onSuccess: (resultado) => {
      if (!resultado.success) return;

      queryClient.invalidateQueries({ queryKey: ["empresas"] });
    },
  });
}
