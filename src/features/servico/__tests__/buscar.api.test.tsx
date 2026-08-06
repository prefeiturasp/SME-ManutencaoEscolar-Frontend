import { beforeEach, describe, expect, it, vi } from "vitest";

import { listarServicosAction } from "../services/buscar.api";

const { requisicaoAutenticadaMock } = vi.hoisted(() => ({
  requisicaoAutenticadaMock: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

describe("listarServicosAction", () => {
  beforeEach(() => {
    requisicaoAutenticadaMock.mockReset();
  });

  it("deve listar os serviços utilizando os filtros informados", async () => {
    const filtros = {
      nome: "Pintura",
      status: true,
      page: 2,
      page_size: 10,
    };

    const resposta = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          uuid: "uuid-servico-1",
          nome: "Pintura",
          status: true,
        },
      ],
    };

    requisicaoAutenticadaMock.mockResolvedValueOnce(resposta);

    const resultado = await listarServicosAction(filtros);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledTimes(1);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "GET",
      url: "/servicos/",
      params: filtros,
    });

    expect(resultado).toEqual(resposta);
  });

  it("deve listar os serviços sem filtros", async () => {
    const resposta = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };

    requisicaoAutenticadaMock.mockResolvedValueOnce(resposta);

    const resultado = await listarServicosAction();

    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "GET",
      url: "/servicos/",
      params: undefined,
    });

    expect(resultado).toEqual(resposta);
  });

  it("deve propagar o erro da requisição autenticada", async () => {
    const erro = new Error("Erro ao listar serviços");

    requisicaoAutenticadaMock.mockRejectedValueOnce(erro);

    await expect(listarServicosAction()).rejects.toThrow(
      "Erro ao listar serviços",
    );
  });
});
