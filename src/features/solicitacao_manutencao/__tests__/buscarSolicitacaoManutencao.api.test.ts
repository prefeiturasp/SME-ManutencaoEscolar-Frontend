import { expect, it, vi } from "vitest";
import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { buscarSolicitacaoManutencaoAction } from "../services/buscarSolicitacaoManutencao.api";

vi.mock("@/actions/http/requisicao-autenticada", () => ({ requisicaoAutenticada: vi.fn() }));

it("consulta detalhes com UUID codificado e retorna a resposta autenticada", async () => {
  const resposta = { uuid: "s1", servicos: [] };
  vi.mocked(requisicaoAutenticada).mockResolvedValueOnce(resposta);
  await expect(buscarSolicitacaoManutencaoAction("s/1")).resolves.toBe(resposta);
  expect(requisicaoAutenticada).toHaveBeenCalledWith({
    method: "GET",
    url: "/solicitacoes-manutencao/s%2F1/",
  });
});

it("propaga erros da consulta autenticada", async () => {
  vi.mocked(requisicaoAutenticada).mockRejectedValueOnce(new Error("Sem acesso"));
  await expect(buscarSolicitacaoManutencaoAction("s1")).rejects.toThrow("Sem acesso");
});
