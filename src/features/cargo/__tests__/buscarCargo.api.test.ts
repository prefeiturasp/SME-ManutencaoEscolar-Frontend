import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buscarCargoAction,
  listarCargosAction,
} from "@/features/cargo/services/buscarCargo.api";

const mocks = vi.hoisted(() => ({
  requisicaoAutenticada: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: mocks.requisicaoAutenticada,
}));

describe("actions de consulta de cargos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listarCargosAction", () => {
    it("consulta os cargos com os filtros informados", async () => {
      const filtros = {
        nome: "Engenheiro",
        exige_documento: false,
        page: 2,
        page_size: 20,
      };

      const resposta = {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            uuid: "uuid-cargo-1",
            nome: "Engenheiro",
            exige_documento: false,
          },
        ],
      };

      mocks.requisicaoAutenticada.mockResolvedValueOnce(resposta);

      await expect(listarCargosAction(filtros)).resolves.toEqual(resposta);

      expect(mocks.requisicaoAutenticada).toHaveBeenCalledExactlyOnceWith({
        method: "GET",
        url: "/cargos/",
        params: filtros,
      });
    });

    it("permite consultar os cargos sem filtros", async () => {
      const resposta = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      mocks.requisicaoAutenticada.mockResolvedValueOnce(resposta);

      await expect(listarCargosAction()).resolves.toEqual(resposta);

      expect(mocks.requisicaoAutenticada).toHaveBeenCalledExactlyOnceWith({
        method: "GET",
        url: "/cargos/",
        params: undefined,
      });
    });

    it("repassa o erro da requisição", async () => {
      const erro = new Error("Falha ao listar cargos");

      mocks.requisicaoAutenticada.mockRejectedValueOnce(erro);

      await expect(listarCargosAction()).rejects.toBe(erro);
    });
  });

  describe("buscarCargoAction", () => {
    it("consulta um cargo pelo UUID", async () => {
      const uuid = "uuid-cargo-1";

      const cargo = {
        uuid,
        nome: "Engenheiro",
        exige_documento: true,
      };

      mocks.requisicaoAutenticada.mockResolvedValueOnce(cargo);

      await expect(buscarCargoAction(uuid)).resolves.toEqual(cargo);

      expect(mocks.requisicaoAutenticada).toHaveBeenCalledExactlyOnceWith({
        method: "GET",
        url: `/cargos/${uuid}/`,
      });
    });

    it("repassa o erro da consulta por UUID", async () => {
      const erro = new Error("Cargo não encontrado");

      mocks.requisicaoAutenticada.mockRejectedValueOnce(erro);

      await expect(buscarCargoAction("uuid-inexistente")).rejects.toBe(erro);
    });
  });
});
