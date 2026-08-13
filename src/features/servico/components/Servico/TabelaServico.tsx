import { TabelaDeDados } from "@/components/shared/TabelaDeDados/TabelaDeDados";

import type { TabelaServicoProps } from "../../types/servicos.types";

export function TabelaServico({
  servicos,
  colunas,
  atualizando = false,
}: Readonly<TabelaServicoProps>) {
  return (
    <TabelaDeDados
      dados={servicos}
      colunas={colunas}
      obterChave={(servico) => servico.uuid ?? ""}
      atualizando={atualizando}
      classNameLinha={(servico) =>
        servico.status ? "" : "bg-background text-blocked-foreground"
      }
    />
  );
}
