import { TabelaDeDados } from "@/components/shared/TabelaDeDados/TabelaDeDados";
import type { TabelaEquipeProps } from "@/features/equipe/types/equipe.types";

export function TabelaEquipe({
  equipes,
  colunas,
  atualizando = false,
}: Readonly<TabelaEquipeProps>) {
  return (
    <div className="overflow-x-auto">
      <TabelaDeDados
        dados={equipes}
        colunas={colunas}
        obterChave={(equipe) => equipe.uuid || equipe.id}
        atualizando={atualizando}
        classNameLinha={(equipe) =>
          equipe.situacao ? "" : "bg-background text-blocked-foreground"
        }
      />
    </div>
  );
}
