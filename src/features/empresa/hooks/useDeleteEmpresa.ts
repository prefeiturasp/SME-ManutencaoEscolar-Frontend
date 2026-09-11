import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletarEmpresa } from "@/features/empresa/services/empresa.service";

export function useDeleteEmpresa(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const resultado = await deletarEmpresa(uuid);

      if (!resultado.success) {
        throw new Error(resultado.message);
      }

      return resultado;
    },
    meta: {
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos excluindo a empresa...",
      },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      queryClient.invalidateQueries({ queryKey: ["empresa", uuid] });
    },
  });
}
