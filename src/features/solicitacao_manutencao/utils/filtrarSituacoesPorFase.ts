import type { Opcao } from "@/components/types/opcao.types";

import type { SituacoesSolicitacaoPorFase } from "../types/solicitacaoManutencao.types";

export function filtrarSituacoesPorFase(
  situacoes: SituacoesSolicitacaoPorFase,
  fases: string[],
): Opcao[] {
  if (fases.length === 0) return Object.values(situacoes).flat();
  return fases.flatMap((fase) => situacoes[fase] ?? []);
}
