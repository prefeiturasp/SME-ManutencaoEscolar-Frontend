import { beforeEach, describe, expect, it, vi } from "vitest";
import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { buscarEquipeAction } from "../services/buscarEquipe.api";
import type { EquipeDetalhe } from "../types/equipe.types";

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: vi.fn(),
}));

beforeEach(() => vi.resetAllMocks());

describe("buscarEquipeAction", () => {
  it("envia GET com o UUID e retorna os dados da equipe", async () => {
    const equipe: EquipeDetalhe = {
      id: 1,
      uuid: "equipe-1",
      nome: "Equipe Norte",
      situacao: true,
      empresa: "empresa-1",
      lote: "lote-1",
      profissionais: [{ profissional: "profissional-1", funcao: "funcao-1" }],
    };
    vi.mocked(requisicaoAutenticada).mockResolvedValue(equipe);

    const resultado = await buscarEquipeAction(equipe.uuid);

    expect(requisicaoAutenticada).toHaveBeenCalledExactlyOnceWith({
      method: "GET",
      url: "/equipes/equipe-1/",
    });
    expect(resultado).toBe(equipe);
  });

  it("propaga o erro da requisição autenticada", async () => {
    const erro = new Error("Não foi possível carregar a equipe.");
    vi.mocked(requisicaoAutenticada).mockRejectedValue(erro);

    await expect(buscarEquipeAction("equipe-1")).rejects.toBe(erro);
    expect(requisicaoAutenticada).toHaveBeenCalledExactlyOnceWith({
      method: "GET",
      url: "/equipes/equipe-1/",
    });
  });
});
