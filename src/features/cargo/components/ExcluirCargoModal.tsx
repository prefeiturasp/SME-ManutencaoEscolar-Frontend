"use client";

import { ExcluirEntidadeModal } from "@/utils/ExcluirEntidadeModal";

import { useExcluirCargo } from "../hooks/useDeleteCargo";

type ExcluirCargoModalProps = {
  uuid: string;
};

export function ExcluirCargoModal({ uuid }: Readonly<ExcluirCargoModalProps>) {
  const { mutateAsync, isPending } = useExcluirCargo(uuid);

  return (
    <ExcluirEntidadeModal
      titulo="Excluir cargo?"
      textoBotao="Excluir cargo"
      mensagemSucesso="O cargo foi excluído."
      mensagemErro="Não conseguimos excluir o cargo. Por favor, tente novamente."
      rotaRetorno="/cargos"
      loading={isPending}
      onExcluir={mutateAsync}
    />
  );
}
