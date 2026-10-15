"use client";

import { useDeleteProfissional } from "@/features/profissional/hooks/useDeleteProfissional";
import { ExcluirEntidadeModal } from "@/utils/ExcluirEntidadeModal";

interface ProfissionalExclusaoProps {
  readonly uuid: string;
}

export function ProfissionalExclusao({ uuid }: ProfissionalExclusaoProps) {
  const { mutateAsync, isPending } = useDeleteProfissional(uuid);

  return (
    <ExcluirEntidadeModal
      titulo="Excluir profissional"
      textoBotao="Excluir profissional"
      mensagemSucesso="O profissional foi excluído."
      mensagemErro="Não conseguimos excluir o profissional. Por favor, tente novamente."
      rotaRetorno="/profissionais"
      loading={isPending}
      onExcluir={mutateAsync}
    />
  );
}
