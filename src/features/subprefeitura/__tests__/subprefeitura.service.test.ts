import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  listarSubprefeiturasAction,
  listarTodasSubprefeiturasAction,
} from "@/features/subprefeitura/service/subprefeitura.service";
import type {
  RespostaSubprefeitura,
  Subprefeitura,
  SubprefeituraListParams,
} from "@/features/subprefeitura/types/subprefeitura.types";

const { requisicaoAutenticadaMock } = vi.hoisted(() => ({
  requisicaoAutenticadaMock: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

const PARAMS: SubprefeituraListParams = {
  codigo_eol: "49",
  nome: "SE",
  diretoria_regional: "DRE IPIRANGA",
  page: 1,
  page_size: "10",
};

const SUBPREFEITURA: Subprefeitura = {
  id: 17,
  uuid: "247cf593-6089-4347-b10a-e132e30f5911",
  codigo_eol: "49",
  nome: "SE",
};

const RESPOSTA: RespostaSubprefeitura = {
  count: 1,
  next: null,
  previous: null,
  results: [SUBPREFEITURA],
};

const TODAS_SUBPREFEITURAS: Subprefeitura[] = [SUBPREFEITURA];

describe("subprefeitura.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listarSubprefeiturasAction", () => {
    it("deve chamar requisicaoAutenticada com os parâmetros informados", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(RESPOSTA);

      const resultado = await listarSubprefeiturasAction(PARAMS);

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/subprefeituras/",
        params: PARAMS,
      });

      expect(resultado).toEqual(RESPOSTA);
    });

    it("deve chamar requisicaoAutenticada com parâmetros undefined", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(RESPOSTA);

      const resultado = await listarSubprefeiturasAction();

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/subprefeituras/",
        params: undefined,
      });

      expect(resultado).toEqual(RESPOSTA);
    });

    it("deve propagar o erro da requisição", async () => {
      const erro = new Error("Erro ao listar subprefeituras");

      requisicaoAutenticadaMock.mockRejectedValue(erro);

      await expect(
        listarSubprefeiturasAction(PARAMS),
      ).rejects.toThrow("Erro ao listar subprefeituras");
    });
  });

  describe("listarTodasSubprefeiturasAction", () => {
    it("deve chamar requisicaoAutenticada com page_size all e filtros", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(
        TODAS_SUBPREFEITURAS,
      );

      const filtros = {
        codigo_eol: PARAMS.codigo_eol,
        nome: PARAMS.nome,
        diretoria_regional: PARAMS.diretoria_regional,
      };

      const resultado = await listarTodasSubprefeiturasAction(filtros);

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/subprefeituras/",
        params: {
          ...filtros,
          page_size: "all",
        },
      });

      expect(resultado).toEqual(TODAS_SUBPREFEITURAS);
    });

    it("deve chamar requisicaoAutenticada somente com page_size all sem filtros", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(
        TODAS_SUBPREFEITURAS,
      );

      const resultado = await listarTodasSubprefeiturasAction();

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/subprefeituras/",
        params: {
          page_size: "all",
        },
      });

      expect(resultado).toEqual(TODAS_SUBPREFEITURAS);
    });

    it("deve propagar o erro da requisição", async () => {
      const erro = new Error(
        "Erro ao listar todas as subprefeituras",
      );

      requisicaoAutenticadaMock.mockRejectedValue(erro);

      await expect(
        listarTodasSubprefeiturasAction(PARAMS),
      ).rejects.toThrow("Erro ao listar todas as subprefeituras");
    });
  });
});