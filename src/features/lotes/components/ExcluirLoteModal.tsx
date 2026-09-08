"use client";

import { ExcluirEntidadeModal } from "@/utils/ExcluirEntidadeModal";

import { useExcluirLote } from "../hooks/useDeleteLote";

type ExcluirLoteModalProps = {
  uuid: string;
};

export function ExcluirLoteModal({ uuid }: Readonly<ExcluirLoteModalProps>) {
  const { mutateAsync, isPending } = useExcluirLote(uuid);

  return (
    <ExcluirEntidadeModal
      titulo="Excluir lote?"
      textoBotao="Excluir lote"
      mensagemSucesso="O lote foi excluído."
      mensagemErro="Não conseguimos excluir o lote. Por favor, tente novamente."
      rotaRetorno="/lotes"
      loading={isPending}
      onExcluir={mutateAsync}
    />
  );
}
