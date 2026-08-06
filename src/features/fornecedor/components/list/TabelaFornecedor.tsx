"use client";

import { TabelaDeDados } from "@/components/shared/TabelaDeDados/TabelaDeDados";
import type { TabelaFornecedorProps } from "../../types/fornecedor.types";

export function TabelaFornecedor({
  fornecedores,
  colunas,
  atualizando = false,
}: Readonly<TabelaFornecedorProps>) {
  return (
    <TabelaDeDados
      dados={fornecedores}
      colunas={colunas}
      obterChave={(fornecedor) => fornecedor.id}
      atualizando={atualizando}
      classNameLinha={(fornecedor) =>
        fornecedor.status ? "" : "bg-gray-light text-blocked-foreground"
      }
    />
  );
}
