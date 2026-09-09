"use client";

import { useExcluirServico } from "@/features/servico/hooks/useDeleteServico";
import { ExcluirEntidadeModal } from "@/utils/ExcluirEntidadeModal";

type ExcluirServicoModalProps = {
  uuid: string;
};

export function ExcluirServicoModal({
  uuid,
}: Readonly<ExcluirServicoModalProps>) {
  const { mutateAsync, isPending } = useExcluirServico(uuid);

  return (
    <ExcluirEntidadeModal
      titulo="Excluir serviço?"
      textoBotao="Excluir serviço"
      mensagemSucesso="O serviço foi excluído."
      mensagemErro="Não conseguimos excluir o serviço. Por favor, tente novamente."
      rotaRetorno="/servicos"
      loading={isPending}
      onExcluir={mutateAsync}
    />
  );
}
