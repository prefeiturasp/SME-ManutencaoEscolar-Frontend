"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirmaDialogo";
import { toastErro, toastSucesso } from "@/components/ui/toast-custom";
import { useExcluirServico } from "@/features/servico/hooks/useDeleteServico";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ExcluirServicoModalProps = {
  uuid: string;
};

export function ExcluirServicoModal({
  uuid,
}: Readonly<ExcluirServicoModalProps>) {
  const router = useRouter();
  const { mutateAsync, isPending } = useExcluirServico(uuid);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  async function confirmarExclusao(): Promise<void> {
    try {
      await mutateAsync();

      toastSucesso({
        titulo: "Sucesso!",
        descricao: "O serviço foi excluído.",
      });

      router.replace("/cadastro/servicos");
    } catch (error: unknown) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não conseguimos excluir o serviço. Por favor, tente novamente.";

      toastErro({
        titulo: "Erro",
        descricao: mensagem,
      });
      router.replace("/cadastro/servicos");
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setModalExcluirAberto(true)}
        variant="destructive"
        size="big-lg"
        className="max-w-[157px] border-[var(--trash-color)] border text-[var(--trash-color)]"
      >
        <Trash2 className="text-current" />
        Excluir serviço
      </Button>

      <ConfirmDialog
        open={modalExcluirAberto}
        loading={isPending}
        title="Excluir serviço?"
        description="A ação não poderá ser desfeita. Tem certeza que deseja continuar?"
        confirmLabel="Excluir serviço"
        onConfirm={confirmarExclusao}
        onOpenChange={setModalExcluirAberto}
      />
    </>
  );
}
