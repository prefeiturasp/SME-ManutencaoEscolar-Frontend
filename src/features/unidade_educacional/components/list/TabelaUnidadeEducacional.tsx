"use client";

import { TabelaDeDados } from "@/components/shared/TabelaDeDados/TabelaDeDados";
import { TabelaUnidadesEducacionaisProps } from "@/features/unidade_educacional/types/unidadesEducacionais.types";

export function TabelaUnidadeEducional({
  unidades,
  colunas,
  atualizando = false,
}: Readonly<TabelaUnidadesEducacionaisProps>) {
  return (
    <TabelaDeDados
      dados={unidades}
      colunas={colunas}
      obterChave={(unidade) => unidade.uuid}
      atualizando={atualizando}
      classNameLinha={(unidade) =>
        unidade.status ? "" : "bg-background text-blocked-foreground"
      }
    />
  );
}
