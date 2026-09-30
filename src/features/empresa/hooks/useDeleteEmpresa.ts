import { deletarEmpresa } from "@/features/empresa/services/empresa.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteEmpresa(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const resultado = await deletarEmpresa(uuid);

      if (!resultado.success) {
        if (resultado.status === 400) {
          throw resultado;
        }

        throw new Error(
          typeof resultado.message === "string"
            ? resultado.message
            : "Não conseguimos excluir a empresa. Por favor, tente novamente.",
        );
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
