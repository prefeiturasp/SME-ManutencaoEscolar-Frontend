"use client";

import { DataTable as TabelaDeDados } from "@/components/shared/TabelaDeDados";
import type { TabelaFornecedorProps } from "../../types/fornecedor.types";

export function TabelaFornecedor({
  fornecedores,
  colunas,
  atualizando = false,
}: Readonly<TabelaFornecedorProps>) {
  if (fornecedores.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum fornecedor encontrado.
      </p>
    );
  }

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
