import { beforeEach, describe, expect, it, vi } from "vitest";

import { listarUnidadesEducacionaisAction } from "@/features/unidade_educacional/services/unidadeEducacional.service";
import type {
    RespostaUnidadeEducacional,
    UnidadeEducacionalListParams,
} from "@/features/unidade_educacional/types/unidadesEducacionais.types";

const { requisicaoAutenticadaMock } = vi.hoisted(() => ({
  requisicaoAutenticadaMock: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

const PARAMS: UnidadeEducacionalListParams = {
  codigo_eol: "400509",
  tipo_escola: "CCI/CIPS",
  diretoria_regional: "DRE IPIRANGA",
  unidade_educacional: "CAMARA MUNICIPAL",
  subprefeitura: "SE",
  lote: "Lote 2025/2027",
  status: "true",
  page: 1,
  page_size: "10",
};

const RESPOSTA: RespostaUnidadeEducacional = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 9466,
      uuid: "c4e02ffc-fff5-4d36-bfca-29712e311379",
      codigo_eol: "400509",
      nome: "CCI/CIPS CAMARA MUNICIPAL DE SAO PAULO",
      diretoria_regional: {
        id: 6,
        codigo: "108600",
        nome: "DIRETORIA REGIONAL DE EDUCACAO IPIRANGA",
        abreviacao: "DRE - IP",
        nome_curto: "DRE IPIRANGA",
      },
      tipo_escola: {
        id: 12,
        uuid: "c0beab6d-ba44-433f-b85e-40b51901b3e4",
        codigo_eol: 14,
        sigla: "CCI/CIPS",
      },
      subprefeitura: {
        id: 17,
        uuid: "247cf593-6089-4347-b10a-e132e30f5911",
        codigo_eol: "49",
        nome: "SE",
      },
      lote: {
        id: 1,
        uuid: "2809f4cc-5b20-471d-8bea-1ed8148640c8",
        codigo: "010203",
        nome: "Lote 2025/2027",
      },
      status: true,
    },
  ],
};

describe("unidadeEducacional.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listarUnidadesEducacionaisAction", () => {
    it("deve chamar requisicaoAutenticada com endpoint e parâmetros corretos", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(RESPOSTA);

      const resultado = await listarUnidadesEducacionaisAction(PARAMS);

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/unidades-educacionais/",
        params: PARAMS,
      });

      expect(resultado).toEqual(RESPOSTA);
    });

    it("deve chamar requisicaoAutenticada sem parâmetros quando filtros não forem informados", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(RESPOSTA);

      const resultado = await listarUnidadesEducacionaisAction();

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/unidades-educacionais/",
        params: undefined,
      });

      expect(resultado).toEqual(RESPOSTA);
    });

    it("deve propagar o erro da requisição autenticada", async () => {
      const erro = new Error("Erro ao listar unidades educacionais");

      requisicaoAutenticadaMock.mockRejectedValue(erro);

      await expect(
        listarUnidadesEducacionaisAction(PARAMS),
      ).rejects.toThrow("Erro ao listar unidades educacionais");
    });
  });
});