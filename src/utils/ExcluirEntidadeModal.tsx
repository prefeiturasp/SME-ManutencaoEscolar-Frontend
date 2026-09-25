"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirmaDialogo";
import { toastErro, toastSucesso } from "@/components/ui/toast-custom";

type ExcluirEntidadeModalProps = Readonly<{
  titulo: string;
  textoBotao: string;
  mensagemSucesso: string;
  mensagemErro: string;
  rotaRetorno: string;
  loading: boolean;
  onExcluir: () => Promise<unknown>;
  onErro?: (erro: unknown) => boolean;
}>;

function obterStatus(valor: unknown): number | undefined {
  if (typeof valor !== "object" || valor === null) {
    return undefined;
  }

  if ("status" in valor && typeof valor.status === "number") {
    return valor.status;
  }

  return undefined;
}

export function ExcluirEntidadeModal({
  titulo,
  textoBotao,
  mensagemSucesso,
  mensagemErro,
  rotaRetorno,
  loading,
  onExcluir,
  onErro,
}: ExcluirEntidadeModalProps) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);

  async function confirmarExclusao(): Promise<void> {
    try {
      const resultado = await onExcluir();
      const status = obterStatus(resultado);

      if (status !== undefined && status >= 400) {
        throw resultado;
      }

      setModalAberto(false);

      toastSucesso({
        titulo: "Sucesso!",
        descricao: mensagemSucesso,
      });

      router.replace(rotaRetorno);
    } catch (error_: unknown) {
      if (onErro?.(error_)) {
        setModalAberto(false);
        return;
      }

      toastErro({
        titulo: "Erro",
        descricao: mensagemErro,
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
