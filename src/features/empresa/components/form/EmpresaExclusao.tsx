"use client";

import { ConfirmDialog } from "@/components/ui/confirmaDialogo";
import { toastErro, toastSucesso } from "@/components/ui/toast-custom";
import { Button } from "@/components/ui/button";
import { obterMensagemErro } from "@/utils/erro";
import { maskCnpj } from "@/utils/formatadores";
import { useDeleteEmpresa } from "@/features/empresa/hooks/useDeleteEmpresa";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface EmpresaExclusaoProps {
  readonly uuid: string;
  readonly cnpj: string;
}

export function EmpresaExclusao({ uuid, cnpj }: EmpresaExclusaoProps) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const excluirEmpresa = useDeleteEmpresa(uuid);

  function confirmarExclusao() {
    excluirEmpresa.mutate(undefined, {
      onSuccess: (resultado) => {
        if (!resultado.success) {
          toastErro({
            titulo: resultado.title,
            descricao:
              "Não conseguimos excluir a empresa. Por favor, tente novamente.",
          });
          return;
        }

        setModalAberto(false);

        toastSucesso({
          titulo: "Sucesso",
          descricao: `A empresa com CNPJ ${maskCnpj(cnpj)} foi excluída.`,
        });
        router.replace("/cadastro/empresas");
      },
      onError: (error) => {
        const mensagemErro = obterMensagemErro(error);

        toastErro({
          titulo: mensagemErro.titulo,
          descricao:
            "Não conseguimos excluir a empresa. Por favor, tente novamente.",
        });
        console.error(
          "Erro inesperado ao excluir empresa:",
          error instanceof Error ? error.message : error,
        );
      },
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        className="border border-destructive"
        onClick={() => setModalAberto(true)}
      >
        <Trash2 />
        Excluir empresa
      </Button>

      <ConfirmDialog
        open={modalAberto}
        title="Excluir empresa"
        description="A ação não poderá ser desfeita. Tem certeza que deseja continuar?"
        confirmLabel="Excluir empresa"
        loading={excluirEmpresa.isPending}
        onOpenChange={setModalAberto}
        onConfirm={confirmarExclusao}
      />
    </>
  );
}
