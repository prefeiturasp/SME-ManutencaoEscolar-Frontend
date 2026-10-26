import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listarSolicitacoesManutencaoAction } from "../services/listarSolicitacoesManutencao.api";

vi.mock("@/actions/http/requisicao-autenticada", () => ({ requisicaoAutenticada: vi.fn() }));
const requisicao = vi.mocked(requisicaoAutenticada);
beforeEach(() => vi.clearAllMocks());
describe("listarSolicitacoesManutencaoAction", () => {
  it("consulta a listagem com GET e encaminha filtros e paginação na query", async () => {
    const params = {
      codigo: "00123",
      fase: "vistoria,execucao",
      situacao: "vistoria_aprovada,execucao_agendada",
      tipo_atendimento: "urgente,comum",
      data_envio_after: "2026-07-01",
      data_envio_before: "2026-07-31",
      page: 2,
      page_size: 20,
    };
    const resposta = { count: 0, next: null, previous: null, results: [] };
    requisicao.mockResolvedValueOnce(resposta);
    await expect(listarSolicitacoesManutencaoAction(params)).resolves.toBe(resposta);
    expect(requisicao).toHaveBeenCalledExactlyOnceWith({
      method: "GET",
      url: "/solicitacoes-manutencao/",
      params,
    });
  });
  it("propaga a falha para o estado de erro da consulta", async () => {
    requisicao.mockRejectedValueOnce(new Error("Sem conexão"));
    await expect(listarSolicitacoesManutencaoAction({ page: 1, page_size: 10 })).rejects.toThrow(
      "Sem conexão",
    );
  });
});
