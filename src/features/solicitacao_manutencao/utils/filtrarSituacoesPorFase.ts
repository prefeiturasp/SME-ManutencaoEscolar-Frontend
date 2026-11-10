import type { Opcao } from "@/components/types/opcao.types";

import { SITUACOES_POR_FASE } from "../constants/situacoesPorFase";

export function filtrarSituacoesPorFase(opcoes: Opcao[], fases: string[]): Opcao[] {
  if (fases.length === 0) return opcoes;

  const permitidas = new Set(
    fases.flatMap((fase) => SITUACOES_POR_FASE[fase] ?? []).map((opcao) => opcao.value),
  );
  return opcoes.filter((opcao) => permitidas.has(opcao.value));
}
