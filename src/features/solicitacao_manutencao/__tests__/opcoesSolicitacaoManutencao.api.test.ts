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

it("preserva as situações agrupadas por fase retornadas pelo endpoint, sem completar opções locais", async () => {
  const opcoes = {
    solicitacao: [{ value: "nao_enviado_dre", label: "Não enviada para DRE" }],
    vistoria: [{ value: "vistoria_nova", label: "Vistoria definida pelo backend" }],
    execucao: [{ value: "execucao_nova", label: "Execução definida pelo backend" }],
    fase_nova: [{ value: "nova_situacao", label: "Nova situação do backend" }],
  };
  vi.mocked(requisicaoAutenticada).mockResolvedValueOnce(opcoes);
  const resultado = await listarOpcoesSolicitacaoManutencaoAction("situacoes");

  expect(resultado).toEqual(opcoes);
  expect(filtrarSituacoesPorFase(resultado, ["solicitacao"])).toEqual(opcoes.solicitacao);
  expect(filtrarSituacoesPorFase(resultado, ["vistoria", "execucao"])).toEqual([
    ...opcoes.vistoria,
    ...opcoes.execucao,
  ]);
  expect(filtrarSituacoesPorFase(resultado, ["fase_nova"])).toEqual(opcoes.fase_nova);
  expect(filtrarSituacoesPorFase(resultado, [])).toHaveLength(4);
  expect(requisicaoAutenticada).toHaveBeenCalledExactlyOnceWith({
    method: "GET",
    url: "/solicitacoes-manutencao/situacoes/",
  });
});

it("não inventa situações quando o backend retorna grupos vazios", async () => {
  const opcoes = { solicitacao: [], vistoria: [], execucao: [] };
  vi.mocked(requisicaoAutenticada).mockResolvedValueOnce(opcoes);
  const resultado = await listarOpcoesSolicitacaoManutencaoAction("situacoes");
  expect(resultado).toEqual(opcoes);
  expect(filtrarSituacoesPorFase(resultado, [])).toEqual([]);
});

it("propaga a falha para permitir nova tentativa na interface", async () => {
  vi.mocked(requisicaoAutenticada).mockRejectedValueOnce(new Error("Sem conexão"));
  await expect(listarOpcoesSolicitacaoManutencaoAction("fases")).rejects.toThrow("Sem conexão");
});
