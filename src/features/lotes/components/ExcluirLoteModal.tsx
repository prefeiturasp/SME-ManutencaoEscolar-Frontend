"use client";

import { ExcluirEntidadeModal } from "@/utils/ExcluirEntidadeModal";
import { useState } from "react";
import type { ErroVinculoLote } from "../types/lotes.types";
import { AlertaErroExclusaoLote } from "./AlertaErroExclusaoLote";

import { useExcluirLote } from "../hooks/useDeleteLote";

type ExcluirLoteModalProps = {
  uuid: string;
};

export function ExcluirLoteModal({ uuid }: Readonly<ExcluirLoteModalProps>) {
  const { mutateAsync, isPending } = useExcluirLote(uuid);
  const [erroVinculo, setErroVinculo] = useState<ErroVinculoLote | null>(null);

  function tratarErroExclusao(erro: unknown): boolean {
    const erroLote = erro as ErroVinculoLote;

    if (erroLote.status !== 400) {
      return false;
    }

    setErroVinculo(erroLote);

    return true;
  }

  const detalhe = erroVinculo?.message;
  const equipes = typeof detalhe === "object" ? (detalhe.equipes ?? []) : [];
  const mensagem = typeof detalhe === "string" ? detalhe : detalhe?.message;

  return (
    <>
      <ExcluirEntidadeModal
        titulo="Excluir lote?"
        textoBotao="Excluir lote"
        mensagemSucesso="O lote foi excluído."
        mensagemErro="Não conseguimos excluir o lote. Por favor, tente novamente."
        rotaRetorno="/lotes"
        loading={isPending}
        onExcluir={mutateAsync}
        onErro={tratarErroExclusao}
      />
      <AlertaErroExclusaoLote
        aberto={erroVinculo !== null}
        titulo={erroVinculo?.title || "Não é possível excluir o lote"}
        mensagem={
          mensagem ||
          "Este lote está vinculado às equipes listadas e, por isso, não pode ser excluído. Remova os vínculos para prosseguir com a exclusão."
        }
        width={672}
        onOpenChange={(aberto) => {
          if (!aberto) setErroVinculo(null);
        }}
        vinculados={equipes}
      />
    </>
  );
}
