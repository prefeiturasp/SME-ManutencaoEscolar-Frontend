import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { beforeEach, expect, it, vi } from "vitest";
import { listarOpcoesSolicitacaoManutencaoAction } from "../services/opcoesSolicitacaoManutencao.api";

vi.mock("@/actions/http/requisicao-autenticada", () => ({ requisicaoAutenticada: vi.fn() }));
beforeEach(() => vi.clearAllMocks());

it.each(["tipos_atendimento", "fases", "situacoes"] as const)(
  "consulta as opções de %s autenticadas preservando os valores do backend",
  async (campo) => {
    const opcoes = [{ value: "novo_valor", label: "Nova opção" }];
    vi.mocked(requisicaoAutenticada).mockResolvedValueOnce(opcoes);
    await expect(listarOpcoesSolicitacaoManutencaoAction(campo)).resolves.toEqual(opcoes);
    expect(requisicaoAutenticada).toHaveBeenCalledExactlyOnceWith({
      method: "GET",
      url: `/solicitacoes-manutencao/${campo === "tipos_atendimento" ? "tipos-atendimento" : campo}/`,
    });
  },
);

it("propaga a falha para permitir nova tentativa na interface", async () => {
  vi.mocked(requisicaoAutenticada).mockRejectedValueOnce(new Error("Sem conexão"));
  await expect(listarOpcoesSolicitacaoManutencaoAction("fases")).rejects.toThrow("Sem conexão");
});
