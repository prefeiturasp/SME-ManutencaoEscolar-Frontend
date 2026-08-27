"use client";

import { TabelaDeDados } from "@/components/shared/TabelaDeDados/TabelaDeDados";

import type { TabelaLoteProps } from "@/features/lotes/types/lotes.types";

export function TabelaLote({
  lotes,
  colunas,
  atualizando = false,
}: Readonly<TabelaLoteProps>) {
  return (
    <TabelaDeDados
      dados={lotes}
      colunas={colunas}
      obterChave={(lote) => lote.id}
      atualizando={atualizando}
      classNameLinha={(lote) =>
        lote.status ? "" : "bg-background text-blocked-foreground"
      }
    />
  );
}
