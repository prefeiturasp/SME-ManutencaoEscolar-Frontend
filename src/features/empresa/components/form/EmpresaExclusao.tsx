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

function ehErroVinculoEmpresa(erro: unknown): erro is ErroVinculoEmpresa {
  if (typeof erro !== "object" || erro === null) {
    return false;
  }

  if (
    !("success" in erro) ||
    erro.success !== false ||
    !("status" in erro) ||
    erro.status !== 400 ||
    !("message" in erro)
  ) {
    return false;
  }

  const detalhe = erro.message;

  if (typeof detalhe !== "object" || detalhe === null) {
    return false;
  }

  if (!("message" in detalhe) || typeof detalhe.message !== "string") {
    return false;
  }

  if ("vinculados" in detalhe) {
    if (
      !Array.isArray(detalhe.vinculados) ||
      !detalhe.vinculados.every((vinculado: unknown) => typeof vinculado === "string")
    ) {
      return false;
    }
  }

  return true;
}

export function EmpresaExclusao({ uuid, cnpj }: EmpresaExclusaoProps) {
  const { mutateAsync, isPending } = useDeleteEmpresa(uuid);

  const [alertaAberto, setAlertaAberto] = useState(false);
  const [tituloAlerta, setTituloAlerta] = useState("");
  const [mensagemAlerta, setMensagemAlerta] = useState("");
  const [lotesVinculados, setLotesVinculados] = useState<string[]>([]);

  function tratarErroExclusao(erro: unknown): boolean {
    if (!ehErroVinculoEmpresa(erro)) {
      return false;
    }

    setTituloAlerta(erro.title ?? "Não é possível excluir a empresa");
    setMensagemAlerta(erro.message.message);
    setLotesVinculados(erro.message.vinculados ?? []);
    setAlertaAberto(true);

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
        aberto={alertaAberto}
        titulo={tituloAlerta}
        mensagem={mensagemAlerta}
        vinculados={lotesVinculados}
        onOpenChange={setAlertaAberto}
      />
    </>
  );
}
