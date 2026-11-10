import type { EditarSolicitacaoManutencaoParams } from "../types/solicitacaoManutencao.types";

export function prepararServicosEdicao(
  servicos: EditarSolicitacaoManutencaoParams["servicos"],
): EditarSolicitacaoManutencaoParams["servicos"] {
  return servicos.map((item) => {
    if (item.servico && item.servico !== "outros") return { ...item, servico_especifico: "" };
    return item.servico_especifico?.trim() ? { ...item, servico: "" } : item;
  });
}
