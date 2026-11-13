"use client";

import { useExcluirEquipe } from "@/features/equipe/hooks/useExcluirEquipe";
import { ExcluirEntidadeModal } from "@/utils/ExcluirEntidadeModal";

type ExcluirEquipeModalProps = Readonly<{ uuid: string }>;

export function ExcluirEquipeModal({ uuid }: ExcluirEquipeModalProps) {
  const { mutateAsync, isPending } = useExcluirEquipe(uuid);

  return (
    <ExcluirEntidadeModal
      titulo="Excluir equipe?"
      textoBotao="Excluir equipe"
      mensagemSucesso="A equipe foi excluída."
      mensagemErro="Não conseguimos excluir a equipe. Por favor, tente novamente."
      rotaRetorno="/empresas/equipes"
      loading={isPending}
      onExcluir={mutateAsync}
    />
  );
}
