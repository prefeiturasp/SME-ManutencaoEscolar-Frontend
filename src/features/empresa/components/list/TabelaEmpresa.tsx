"use client";

import { TabelaDeDados } from "@/components/shared/TabelaDeDados/TabelaDeDados";
import type { TabelaEmpresaProps } from "../../types/empresa.types";

export function TabelaEmpresa({
  empresas,
  colunas,
  atualizando = false,
}: Readonly<TabelaEmpresaProps>) {
  return (
    <TabelaDeDados
      dados={empresas}
      colunas={colunas}
      obterChave={(empresa) => empresa.id}
      atualizando={atualizando}
      classNameLinha={(empresa) =>
        empresa.status ? "" : "bg-background text-blocked-foreground"
      }
    />
  );
}
