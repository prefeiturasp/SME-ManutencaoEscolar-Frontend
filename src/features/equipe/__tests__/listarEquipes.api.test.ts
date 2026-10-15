import { beforeEach, describe, expect, it, vi } from "vitest";
import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { listarEquipesAction } from "../services/listarEquipes.api";
import type { EquipeListParams, RespostaEquipes } from "../types/equipe.types";

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: vi.fn(),
}));

beforeEach(() => vi.resetAllMocks());

describe("listarEquipesAction", () => {
  it.each<EquipeListParams>([
    { page: 1 },
    {
      page: 2,
      page_size: 20,
      nome: "Equipe Norte",
      empresa: "empresa-1",
      lote: "lote-1",
      situacao: false,
    },
    { page: 1, page_size: "all", situacao: true },
  ])("envia GET para /equipes/ com os parâmetros %j e retorna a resposta", async (filtros) => {
    const resposta: RespostaEquipes = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
    vi.mocked(requisicaoAutenticada).mockResolvedValue(resposta);

    const resultado = await listarEquipesAction(filtros);

    expect(requisicaoAutenticada).toHaveBeenCalledExactlyOnceWith({
      method: "GET",
      url: "/equipes/",
      params: filtros,
    });
    expect(resultado).toBe(resposta);
  });

  it("propaga o erro da requisição autenticada", async () => {
    const erro = new Error("Não foi possível carregar as equipes.");
    vi.mocked(requisicaoAutenticada).mockRejectedValue(erro);

    await expect(listarEquipesAction({ page: 1 })).rejects.toBe(erro);
    expect(requisicaoAutenticada).toHaveBeenCalledOnce();
  });
});
