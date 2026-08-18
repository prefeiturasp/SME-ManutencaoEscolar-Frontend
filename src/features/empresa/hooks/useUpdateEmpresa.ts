import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atualizarEmpresa } from "@/features/empresa/services/empresa.service";
import type { EmpresaFormValues } from "@/features/empresa/types/empresa.types";

export function useUpdateEmpresa(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmpresaFormValues) => atualizarEmpresa(uuid, payload),
    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos atualizando a empresa...",
      },
    },
    onSuccess: (resultado) => {
      if (!resultado.success) return;

      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      queryClient.invalidateQueries({ queryKey: ["empresa", uuid] });
    },
  });
}
