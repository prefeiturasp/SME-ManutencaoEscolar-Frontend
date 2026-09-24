import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  atualizarUnidadeEducacional,
  buscarUnidadeEducacionalPorUuid,
  listarTodasUnidadesEducacionaisAction,
  listarUnidadesEducacionaisAction,
} from "@/features/unidade_educacional/services/unidadeEducacional.service";
import type {
  AtualizarUnidadeEducacionalPayload,
  RespostaUnidadeEducacional,
  UnidadeEducacional,
  UnidadeEducacionalListParams,
} from "@/features/unidade_educacional/types/unidadesEducacionais.types";

const { requisicaoAutenticadaMock, obterResultadoErroMock } = vi.hoisted(() => ({
  requisicaoAutenticadaMock: vi.fn(),
  obterResultadoErroMock: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

vi.mock(
  "@/features/unidade_educacional/services/obterResultadoErroUnidadeEducacional",
  () => ({
    obterResultadoErroUnidadeEducacional: obterResultadoErroMock,
  }),
);

const UUID = "c4e02ffc-fff5-4d36-bfca-29712e311379";

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
      uuid: UUID,
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

const PAYLOAD: AtualizarUnidadeEducacionalPayload = {
  email: "unidade@example.com",
  telefone: "1133334444",
  ativo: true,
  responsaveis: [
    {
      uuid: "b5c5a1b0-6b5e-4a7e-9b6f-123456789abc",
      registro_funcional: "1234567",
      nome: "Responsável Teste",
      cargo: "DIRETOR",
      email: "responsavel@example.com",
      telefone: "1133334444",
      celular: "11999999999",
      criado_pelo_sincronizador: true,
    },
    {
      registro_funcional: "7654321",
      nome: "Novo Responsável",
      cargo: "VICE-DIRETOR",
      email: "novo@example.com",
      telefone: "",
      celular: "",
      criado_pelo_sincronizador: false,
    },
  ],
};

describe("unidadeEducacional.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listarUnidadesEducacionaisAction", () => {
    it("deve listar unidades com os filtros informados", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(RESPOSTA);

      const resultado = await listarUnidadesEducacionaisAction(PARAMS);

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/unidades-educacionais/",
        params: PARAMS,
      });

      expect(resultado).toEqual(RESPOSTA);
    });

    it("deve listar unidades sem filtros quando eles não forem informados", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(RESPOSTA);

      const resultado = await listarUnidadesEducacionaisAction();

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/unidades-educacionais/",
        params: undefined,
      });

      expect(resultado).toEqual(RESPOSTA);
    });

    it("deve propagar o erro da requisição", async () => {
      const erro = new Error("Erro ao listar unidades educacionais");

      requisicaoAutenticadaMock.mockRejectedValue(erro);

      await expect(listarUnidadesEducacionaisAction(PARAMS)).rejects.toThrow(
        "Erro ao listar unidades educacionais",
      );
    });
  });

  describe("listarTodasUnidadesEducacionaisAction", () => {
    it("deve listar todas as unidades com os filtros informados", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(RESPOSTA);

      const filtros = {
        codigo_eol: PARAMS.codigo_eol,
        tipo_escola: PARAMS.tipo_escola,
        diretoria_regional: PARAMS.diretoria_regional,
        unidade_educacional: PARAMS.unidade_educacional,
        subprefeitura: PARAMS.subprefeitura,
        lote: PARAMS.lote,
        status: PARAMS.status,
      };

      const resultado = await listarTodasUnidadesEducacionaisAction(filtros);

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/unidades-educacionais/",
        params: {
          ...filtros,
          page_size: "all",
        },
      });

      expect(resultado).toEqual(RESPOSTA.results);
    });

    it("deve listar todas as unidades somente com page_size all quando não houver filtros", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(RESPOSTA);

      const resultado = await listarTodasUnidadesEducacionaisAction();

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/unidades-educacionais/",
        params: {
          page_size: "all",
        },
      });

      expect(resultado).toEqual(RESPOSTA.results);
    });

    it("deve propagar o erro da requisição", async () => {
      const erro = new Error("Erro ao listar todas as unidades educacionais");

      requisicaoAutenticadaMock.mockRejectedValue(erro);

      await expect(
        listarTodasUnidadesEducacionaisAction(PARAMS),
      ).rejects.toThrow("Erro ao listar todas as unidades educacionais");
    });
  });

  describe("buscarUnidadeEducacionalPorUuid", () => {
    it("deve buscar a unidade pelo UUID", async () => {
      const unidade: UnidadeEducacional = RESPOSTA.results[0];

      requisicaoAutenticadaMock.mockResolvedValue(unidade);

      const resultado = await buscarUnidadeEducacionalPorUuid(UUID);

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: `/unidades-educacionais/${UUID}`,
      });

      expect(resultado).toEqual(unidade);
    });

    it("deve propagar o erro da requisição", async () => {
      const erro = new Error("Erro ao buscar unidade educacional");

      requisicaoAutenticadaMock.mockRejectedValue(erro);

      await expect(buscarUnidadeEducacionalPorUuid(UUID)).rejects.toThrow(
        "Erro ao buscar unidade educacional",
      );
    });
  });

  describe("atualizarUnidadeEducacional", () => {
    it("deve atualizar a unidade e retornar sucesso", async () => {
      requisicaoAutenticadaMock.mockResolvedValue(undefined);

      const resultado = await atualizarUnidadeEducacional(UUID, PAYLOAD);

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "PUT",
        url: `/unidades-educacionais/${UUID}/`,
        data: PAYLOAD,
      });

      expect(resultado).toEqual({
        success: true,
      });

      expect(obterResultadoErroMock).not.toHaveBeenCalled();
    });

    it("deve transformar o erro da API em resultado de erro", async () => {
      const erro = new Error("Erro ao atualizar unidade educacional");

      const resultadoErro = {
        success: false as const,
        error: "api-error" as const,
        title: "Não é possível adicionar o contato",
        message: "Já existe um contato com o CPF/RF informado.",
        status: 400,
      };

      requisicaoAutenticadaMock.mockRejectedValue(erro);
      obterResultadoErroMock.mockReturnValue(resultadoErro);

      const resultado = await atualizarUnidadeEducacional(UUID, PAYLOAD);

      expect(obterResultadoErroMock).toHaveBeenCalledWith(erro);
      expect(resultado).toEqual(resultadoErro);
    });
  });
});