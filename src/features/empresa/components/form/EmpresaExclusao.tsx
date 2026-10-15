"use client";

import { useState } from "react";

import { AlertaErroVinculoEmpresa } from "@/app/(cadastro)/empresas/components/AlertaErroVinculoEmpresa";
import { useDeleteEmpresa } from "@/features/empresa/hooks/useDeleteEmpresa";
import { ExcluirEntidadeModal } from "@/utils/ExcluirEntidadeModal";
import { maskCnpj } from "@/utils/formatadores";

interface EmpresaExclusaoProps {
  readonly uuid: string;
  readonly cnpj: string;
}

type ErroVinculoEmpresa = {
  success: false;
  status: 400;
  title?: string;
  message: {
    message: string;
    vinculados?: string[];
  };
};

export function EmpresaExclusao({ uuid, cnpj }: EmpresaExclusaoProps) {
  const { mutateAsync, isPending } = useDeleteEmpresa(uuid);

  const [erroVinculo, setErroVinculo] = useState<ErroVinculoEmpresa | null>(null);

  function tratarErroExclusao(erro: unknown): boolean {
    const erroEmpresa = erro as ErroVinculoEmpresa;

    if (erroEmpresa.status !== 400) {
      return false;
    }

    setErroVinculo(erroEmpresa);

    return true;
  }

  return (
    <>
      <ExcluirEntidadeModal
        titulo="Excluir empresa"
        textoBotao="Excluir empresa"
        mensagemSucesso={`A empresa com CNPJ ${maskCnpj(cnpj)} foi excluída.`}
        mensagemErro="Não conseguimos excluir a empresa. Por favor, tente novamente."
        rotaRetorno="/empresas"
        loading={isPending}
        onExcluir={mutateAsync}
        onErro={tratarErroExclusao}
      />

      <AlertaErroVinculoEmpresa
        aberto={erroVinculo !== null}
        titulo={erroVinculo?.title ?? "Não é possível excluir a empresa"}
        mensagem={erroVinculo?.message.message ?? ""}
        vinculados={erroVinculo?.message.vinculados ?? []}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setErroVinculo(null);
          }
        }}
      />
    </>
  );
}
