import { beforeEach, describe, expect, it, vi } from "vitest";

import { listarDiretoriasRegionaisAction } from "@/features/diretoria_regional/service/listarDiretoriasRegionais.api";
import type { RespostaDiretoriasRegionais } from "@/features/diretoria_regional/types/diretoriasRegionais.types";

const requisicaoAutenticadaMock = vi.hoisted(() => vi.fn());

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

describe("listarDiretoriasRegionaisAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("realiza a requisição com método, URL e paginação corretos", async () => {
    const resposta = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          codigo: "DRE-001",
          nome: "DIRETORIA REGIONAL DE EDUCACAO PENHA",
          abreviacao: "PENHA",
          nome_curto_dre: "DRE PENHA",
        },
      ],
    } as RespostaDiretoriasRegionais;

    requisicaoAutenticadaMock.mockResolvedValue(resposta);

    const resultado = await listarDiretoriasRegionaisAction();

    expect(requisicaoAutenticadaMock).toHaveBeenCalledTimes(1);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "GET",
      url: "/diretoria-regional/",
      params: {
        page: 1,
        page_size: 100,
      },
    });

    expect(resultado).toEqual(resposta);
  });

  it("retorna a resposta recebida da API", async () => {
    const resposta = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    } as RespostaDiretoriasRegionais;

    requisicaoAutenticadaMock.mockResolvedValue(resposta);

    await expect(listarDiretoriasRegionaisAction()).resolves.toEqual(resposta);
  });

  it("propaga o erro quando a requisição falha", async () => {
    const error = new Error("Erro ao listar diretorias regionais");

    requisicaoAutenticadaMock.mockRejectedValue(error);

    await expect(listarDiretoriasRegionaisAction()).rejects.toThrow(
      "Erro ao listar diretorias regionais",
    );
  });
});
