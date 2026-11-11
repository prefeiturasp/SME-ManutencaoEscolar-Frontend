import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { beforeEach, expect, it, vi } from "vitest";
import { listarOpcoesSolicitacaoManutencaoAction } from "../services/opcoesSolicitacaoManutencao.api";
import { filtrarSituacoesPorFase } from "../utils/filtrarSituacoesPorFase";

vi.mock("@/actions/http/requisicao-autenticada", () => ({ requisicaoAutenticada: vi.fn() }));
beforeEach(() => vi.clearAllMocks());

it.each(["tipos-atendimento", "fases"] as const)(
  "consulta as opções de %s autenticadas preservando os valores do backend",
  async (campo) => {
    const opcoes = [{ value: "novo_valor", label: "Nova opção" }];
    vi.mocked(requisicaoAutenticada).mockResolvedValueOnce(opcoes);
    await expect(listarOpcoesSolicitacaoManutencaoAction(campo)).resolves.toEqual(opcoes);
    expect(requisicaoAutenticada).toHaveBeenCalledExactlyOnceWith({
      method: "GET",
      url: `/solicitacoes-manutencao/${campo === "tipos-atendimento" ? "tipos-atendimento" : campo}/`,
    });
  },
);

it("completa Vistoria e Execução quando o backend retorna somente Solicitação", async () => {
  const opcoes = [{ value: "nao_enviado_dre", label: "Não enviada para DRE" }];
  vi.mocked(requisicaoAutenticada).mockResolvedValueOnce(opcoes);
  const resultado = await listarOpcoesSolicitacaoManutencaoAction("situacoes");

  expect(filtrarSituacoesPorFase(resultado, ["solicitacao"])).toEqual(opcoes);
  expect(filtrarSituacoesPorFase(resultado, ["vistoria"]).map((opcao) => opcao.label)).toEqual([
    "Vistoria aguardando agendamento",
    "Vistoria agendada",
    "Vistoria atrasada",
    "Vistoria realizada",
    "Vistoria aprovada",
    "Vistoria em revisão",
  ]);
  expect(filtrarSituacoesPorFase(resultado, ["execucao"]).map((opcao) => opcao.label)).toEqual([
    "Execução aguardando agendamento",
    "Execução agendada",
    "Execução em andamento",
    "Execução atrasada",
    "Execução realizada",
    "Execução com ateste UE",
  ]);
  expect(filtrarSituacoesPorFase(resultado, ["vistoria", "execucao"])).toHaveLength(12);
  expect(filtrarSituacoesPorFase(resultado, [])).toHaveLength(13);
  expect(requisicaoAutenticada).toHaveBeenCalledExactlyOnceWith({
    method: "GET",
    url: "/solicitacoes-manutencao/situacoes/",
  });
});

it("preserva as opções da API sem duplicar as situações complementares", async () => {
  const opcoes = [
    { value: "vistoria_aprovada", label: "Vistoria aprovada pela API" },
    { value: "execucao_realizada", label: "Execução realizada pela API" },
    { value: "nova_situacao", label: "Nova situação" },
  ];
  vi.mocked(requisicaoAutenticada).mockResolvedValueOnce(opcoes);
  const resultado = await listarOpcoesSolicitacaoManutencaoAction("situacoes");
  expect(resultado).toEqual(expect.arrayContaining(opcoes));
  expect(resultado).toHaveLength(13);
  expect(new Set(resultado.map((opcao) => opcao.value)).size).toBe(resultado.length);
});

it("propaga a falha para permitir nova tentativa na interface", async () => {
  vi.mocked(requisicaoAutenticada).mockRejectedValueOnce(new Error("Sem conexão"));
  await expect(listarOpcoesSolicitacaoManutencaoAction("fases")).rejects.toThrow("Sem conexão");
});
