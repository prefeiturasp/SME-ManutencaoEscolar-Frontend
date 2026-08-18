import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletarEmpresa } from "../services/empresa.service";

export function useDeleteEmpresa(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deletarEmpresa(uuid),
    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos excluindo a empresa...",
      },
    },
    onSuccess: (resultado) => {
      if (!resultado.success) return;

      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      queryClient.invalidateQueries({ queryKey: ["empresa", uuid] });
    },
  });
}
