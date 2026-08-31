import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    listarTiposUnidadeAction,
    listarTodasTiposUnidadeAction,
} from "@/features/tipo_unidade/service/tipoUnidade.service";
import type {
    RespostaTipoUnidade,
    TipoUnidade,
    TipoUnidadeListParams,
} from "@/features/tipo_unidade/types/tipoUnidades.types";

const { requisicaoAutenticadaMock } = vi.hoisted(() => ({
  requisicaoAutenticadaMock: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

const TIPO_UNIDADE: TipoUnidade = {
  id: 12,
  uuid: "c0beab6d-ba44-433f-b85e-40b51901b3e4",
  codigo_eol: "14",
  sigla: "CCI/CIPS",
};

const PARAMS: TipoUnidadeListParams = {
  sigla: "CCI/CIPS",
  page: 1,
  page_size: "10",
};

const RESPOSTA: RespostaTipoUnidade = {
  count: 1,
  next: null,
  previous: null,
  results: [TIPO_UNIDADE],
};

const TODOS_TIPOS: TipoUnidade[] = [TIPO_UNIDADE];

describe("tipoUnidade.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listarTiposUnidadeAction", () => {
    it("deve chamar requisicaoAutenticada com os parâmetros informados", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(RESPOSTA);

      const resultado = await listarTiposUnidadeAction(PARAMS);

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/tipos-escola/",
        params: PARAMS,
      });

      expect(resultado).toEqual(RESPOSTA);
    });

    it("deve chamar requisicaoAutenticada com parâmetros undefined", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(RESPOSTA);

      const resultado = await listarTiposUnidadeAction();

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/tipos-escola/",
        params: undefined,
      });

      expect(resultado).toEqual(RESPOSTA);
    });

    it("deve propagar o erro da requisição", async () => {
      const erro = new Error("Erro ao listar tipos de unidade");

      requisicaoAutenticadaMock.mockRejectedValue(erro);

      await expect(
        listarTiposUnidadeAction(PARAMS),
      ).rejects.toThrow("Erro ao listar tipos de unidade");
    });
  });

  describe("listarTodasTiposUnidadeAction", () => {
    it("deve chamar requisicaoAutenticada com page_size all e filtros", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(TODOS_TIPOS);

      const filtros = {
        sigla: "CCI/CIPS",
      };

      const resultado = await listarTodasTiposUnidadeAction(filtros);

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/tipos-escola/",
        params: {
          ...filtros,
          page_size: "all",
        },
      });

      expect(resultado).toEqual(TODOS_TIPOS);
    });

    it("deve chamar requisicaoAutenticada somente com page_size all sem filtros", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(TODOS_TIPOS);

      const resultado = await listarTodasTiposUnidadeAction();

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/tipos-escola/",
        params: {
          page_size: "all",
        },
      });

      expect(resultado).toEqual(TODOS_TIPOS);
    });

    it("deve propagar o erro da requisição", async () => {
      const erro = new Error(
        "Erro ao listar todos os tipos de unidade",
      );

      requisicaoAutenticadaMock.mockRejectedValue(erro);

      await expect(
        listarTodasTiposUnidadeAction(PARAMS),
      ).rejects.toThrow(
        "Erro ao listar todos os tipos de unidade",
      );
    });
  });
});