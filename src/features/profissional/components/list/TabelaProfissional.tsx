"use client";

import { TabelaDeDados } from "@/components/shared/TabelaDeDados/TabelaDeDados";
import type { TabelaProfissionalProps } from "@/features/profissional/types/profissional.types";

export function TabelaProfissional({
  profissionais,
  colunas,
  atualizando = false,
}: Readonly<TabelaProfissionalProps>) {
  return (
    <TabelaDeDados
      dados={profissionais}
      colunas={colunas}
      obterChave={(profissional) => profissional.uuid}
      atualizando={atualizando}
      classNameLinha={(profissional) =>
        profissional.status ? "" : "bg-background text-blocked-foreground"
      }
    />
  );
}
