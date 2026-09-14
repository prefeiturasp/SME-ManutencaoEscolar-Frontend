"use client";

import { useDeleteEmpresa } from "@/features/empresa/hooks/useDeleteEmpresa";
import { ExcluirEntidadeModal } from "@/utils/ExcluirEntidadeModal";
import { maskCnpj } from "@/utils/formatadores";

interface EmpresaExclusaoProps {
  readonly uuid: string;
  readonly cnpj: string;
}

export function EmpresaExclusao({ uuid, cnpj }: EmpresaExclusaoProps) {
  const { mutateAsync, isPending } = useDeleteEmpresa(uuid);

  return (
    <ExcluirEntidadeModal
      titulo="Excluir empresa"
      textoBotao="Excluir empresa"
      mensagemSucesso={`A empresa com CNPJ ${maskCnpj(cnpj)} foi excluída.`}
      mensagemErro="Não conseguimos excluir a empresa. Por favor, tente novamente."
      rotaRetorno="/empresas"
      loading={isPending}
      onExcluir={mutateAsync}
    />
  );
}
