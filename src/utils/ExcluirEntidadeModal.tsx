"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirmaDialogo";
import { toastErro, toastSucesso } from "@/components/ui/toast-custom";

type ExcluirEntidadeModalProps = {
  titulo: string;
  textoBotao: string;
  mensagemSucesso: string;
  mensagemErro: string;
  rotaRetorno: string;
  loading: boolean;
  onExcluir: () => Promise<unknown>;
};

export function ExcluirEntidadeModal({
  titulo,
  textoBotao,
  mensagemSucesso,
  mensagemErro,
  rotaRetorno,
  loading,
  onExcluir,
}: Readonly<ExcluirEntidadeModalProps>) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);

  async function confirmarExclusao(): Promise<void> {
    try {
      await onExcluir();

      toastSucesso({
        titulo: "Sucesso!",
        descricao: mensagemSucesso,
      });

      router.replace(rotaRetorno);
    } catch (error: unknown) {
      toastErro({
        titulo: "Erro",
        descricao: error instanceof Error ? error.message : mensagemErro,
      });
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setModalAberto(true)}
        variant="destructive"
        size="big-lg"
        className="max-w-[157px] border border-[var(--trash-color)] text-[var(--trash-color)]"
      >
        <Trash2 className="text-current" />
        {textoBotao}
      </Button>

      <ConfirmDialog
        open={modalAberto}
        loading={loading}
        title={titulo}
        description="A ação não poderá ser desfeita. Tem certeza que deseja continuar?"
        confirmLabel={textoBotao}
        onConfirm={confirmarExclusao}
        onOpenChange={setModalAberto}
      />
    </>
  );
}
