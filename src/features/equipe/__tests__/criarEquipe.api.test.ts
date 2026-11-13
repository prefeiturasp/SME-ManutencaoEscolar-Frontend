import { beforeEach, describe, expect, it, vi } from "vitest";
import { criarEquipeAction } from "../services/criarEquipe.api";
import type { EquipeFormData } from "../schema/equipeSchema";
const mocks = vi.hoisted(() => ({ requisicao: vi.fn(), erro: vi.fn() }));
vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: mocks.requisicao,
}));
vi.mock("../services/obterResultadoErroEquipe", () => ({ obterResultadoErroEquipe: mocks.erro }));
const dados: EquipeFormData = {
  nome: " Equipe amarela ",
  situacao: "true",
  empresa: "empresa-1",
  lote: "lote-1",
  profissionais: [
    { profissional: "p1", funcao: "f1" },
    { profissional: "p2", funcao: "f2" },
  ],
};
beforeEach(() => vi.clearAllMocks());
describe("criarEquipeAction", () => {
  it.each(["true", "false"] as const)(
    "envia objeto com situação booleana para %s e preserva os UUIDs",
    async (situacao) => {
      const payload = {
        nome: "Equipe amarela",
        situacao: situacao === "true",
        empresa: dados.empresa,
        lote: dados.lote,
        profissionais: dados.profissionais,
      };
      const equipe = { ...payload, id: 1, uuid: "e1" };
      mocks.requisicao.mockResolvedValue(equipe);
      expect(await criarEquipeAction({ ...dados, situacao })).toEqual({ success: true, equipe });
      expect(mocks.requisicao).toHaveBeenCalledWith({
        method: "POST",
        url: "/equipes/",
        data: payload,
      });
      expect(mocks.erro).not.toHaveBeenCalled();
    },
  );
  it("encaminha falhas para o tratamento de erros", async () => {
    const error = new Error("Erro do backend");
    const resultado = {
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Falha",
      status: 400,
    };
    mocks.requisicao.mockRejectedValue(error);
    mocks.erro.mockReturnValue(resultado);
    expect(await criarEquipeAction(dados)).toEqual(resultado);
    expect(mocks.erro).toHaveBeenCalledWith(error);
  });
  it("propaga erros inesperados relançados pelo tratamento", async () => {
    const error = new Error("Falha inesperada");
    mocks.requisicao.mockRejectedValue(error);
    mocks.erro.mockImplementation(() => {
      throw error;
    });
    await expect(criarEquipeAction(dados)).rejects.toThrow(error);
  });
});
