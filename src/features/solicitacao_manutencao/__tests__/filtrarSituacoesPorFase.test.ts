import { expect, it } from "vitest";
import { filtrarSituacoesPorFase } from "../utils/filtrarSituacoesPorFase";

it("não retorna situações de outras fases quando recebe uma fase desconhecida", () => {
  const opcoes = [{ value: "vistoria_aprovada", label: "Vistoria aprovada" }];
  expect(filtrarSituacoesPorFase(opcoes, ["fase_futura"])).toEqual([]);
});

it("ignora fases desconhecidas e preserva as opções das fases reconhecidas", () => {
  const opcoes = [
    { value: "execucao_agendada", label: "Execução agendada" },
    { value: "vistoria_aprovada", label: "Descrição recebida da API" },
    { value: "nao_enviado_dre", label: "Não enviada para DRE" },
  ];
  expect(filtrarSituacoesPorFase(opcoes, ["fase_futura", "vistoria"])).toEqual([opcoes[1]]);
  expect(opcoes).toHaveLength(3);
});
