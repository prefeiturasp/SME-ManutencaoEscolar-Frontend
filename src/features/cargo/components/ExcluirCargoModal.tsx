"use client";

import { useState } from "react";

import { AlertaErroVinculoCargo } from "@/app/(cadastro)/cargos/components/AlertaErroVinculoCargo";
import { ExcluirEntidadeModal } from "@/utils/ExcluirEntidadeModal";

import { useExcluirCargo } from "../hooks/useDeleteCargo";
import { ErroVinculoCargo, ExcluirCargoModalProps } from "../types/cargos.types";

export function ExcluirCargoModal({ uuid }: Readonly<ExcluirCargoModalProps>) {
  const { mutateAsync, isPending } = useExcluirCargo(uuid);

  const [erroVinculo, setErroVinculo] = useState<ErroVinculoCargo | null>(null);

  function tratarErroExclusao(erro: unknown): boolean {
    const erroCargo = erro as ErroVinculoCargo;

    if (erroCargo.status !== 400) {
      return false;
    }

    setErroVinculo(erroCargo);

    return true;
  }

  return (
    <>
      <ExcluirEntidadeModal
        titulo="Excluir cargo?"
        textoBotao="Excluir cargo"
        mensagemSucesso="O cargo foi excluído."
        mensagemErro="Não conseguimos excluir o cargo. Por favor, tente novamente."
        rotaRetorno="/cargos"
        loading={isPending}
        onExcluir={mutateAsync}
        onErro={tratarErroExclusao}
      />

      <AlertaErroVinculoCargo
        aberto={erroVinculo !== null}
        titulo={erroVinculo?.title ?? "Não é possível excluir o cargo"}
        mensagem={erroVinculo?.message.message ?? ""}
        vinculados={erroVinculo?.message.vinculados ?? []}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setErroVinculo(null);
          }
        }}
        width={672}
      />
    </>
  );
}
