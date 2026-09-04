"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirmaDialogo";
import { toastErro, toastSucesso } from "@/components/ui/toast-custom";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useExcluirLote } from "../hooks/useDeleteLote";

type ExcluirLoteModalProps = {
  uuid: string;
};

export function ExcluirLoteModal({ uuid }: Readonly<ExcluirLoteModalProps>) {
  const router = useRouter();
  const { mutateAsync, isPending } = useExcluirLote(uuid);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  async function confirmarExclusao(): Promise<void> {
    try {
      await mutateAsync();

      toastSucesso({
        titulo: "Sucesso!",
        descricao: "O lote foi excluído.",
      });

      router.replace("/lotes");
    } catch (error: unknown) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não conseguimos excluir o serviço. Por favor, tente novamente.";

      toastErro({
        titulo: "Erro",
        descricao: mensagem,
      });
      router.replace("/lotes");
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
        Excluir lote
      </Button>

      <ConfirmDialog
        open={modalExcluirAberto}
        loading={isPending}
        title="Excluir Lote?"
        description="A ação não poderá ser desfeita. Tem certeza que deseja continuar?"
        confirmLabel="Excluir lote"
        onConfirm={confirmarExclusao}
        onOpenChange={setModalExcluirAberto}
      />
    </>
  );
}
