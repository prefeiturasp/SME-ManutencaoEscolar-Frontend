import { expect, it } from "vitest";
import { filtrarSituacoesPorFase } from "../utils/filtrarSituacoesPorFase";

it("não retorna situações de outras fases quando recebe uma fase desconhecida", () => {
  const opcoes = { vistoria: [{ value: "vistoria_aprovada", label: "Vistoria aprovada" }] };
  expect(filtrarSituacoesPorFase(opcoes, ["fase_futura"])).toEqual([]);
});

it("ignora fases desconhecidas e preserva as opções das fases reconhecidas", () => {
  const opcoes = {
    execucao: [{ value: "execucao_agendada", label: "Execução agendada" }],
    vistoria: [{ value: "vistoria_aprovada", label: "Descrição recebida da API" }],
    solicitacao: [{ value: "nao_enviado_dre", label: "Não enviada para DRE" }],
  };
  expect(filtrarSituacoesPorFase(opcoes, ["fase_futura", "vistoria"])).toEqual(opcoes.vistoria);
  expect(Object.values(opcoes).flat()).toHaveLength(3);
});

it("aceita uma fase nova com valores sem relação com o nome da fase", () => {
  const opcoes = { fase_futura: [{ value: "status_123", label: "Descrição do backend" }] };
  expect(filtrarSituacoesPorFase(opcoes, ["fase_futura"])).toEqual(opcoes.fase_futura);
});

it("combina todas as fases quando nenhuma é selecionada", () => {
  const opcoes = {
    solicitacao: [{ value: "a", label: "Primeira" }],
    vistoria: [{ value: "b", label: "Segunda" }],
    execucao: [],
  };
  expect(filtrarSituacoesPorFase(opcoes, [])).toEqual([...opcoes.solicitacao, ...opcoes.vistoria]);
  expect(filtrarSituacoesPorFase({}, [])).toEqual([]);
});
