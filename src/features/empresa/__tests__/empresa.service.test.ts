import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  atualizarEmpresa,
  buscarEmpresaPorUuid,
  criarEmpresa,
  listarEmpresas,
} from "@/features/empresa/services/empresa.service";

const { requisicaoAutenticadaMock } = vi.hoisted(() => ({
  requisicaoAutenticadaMock: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

const { isAxiosErrorMock } = vi.hoisted(() => ({
  isAxiosErrorMock: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    isAxiosError: isAxiosErrorMock,
  },
  isAxiosError: isAxiosErrorMock,
}));

const PAYLOAD = {
  nome: "Empresa",
  cnpj: "11444777000161",
  status: true,
  razao_social: "Empresa LTDA",
  link_rastreio: "https://example.com",
  cep: "01310100",
  logradouro: "Rua",
  numero: "123",
  complemento: "",
  cidade: "São Paulo",
  estado: "SP",
};

describe("empresa.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAxiosErrorMock.mockReturnValue(false);
  });

  describe("criarEmpresa", () => {
    it("deve chamar requisicaoAutenticada com endpoint correto e retornar sucesso", async () => {
      const empresaCriada = { id: 1, ...PAYLOAD };
      requisicaoAutenticadaMock.mockResolvedValue(empresaCriada);

      const resultado = await criarEmpresa(PAYLOAD);

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "POST",
        url: "/empresas",
        data: PAYLOAD,
      });

      expect(resultado).toEqual({ success: true, empresa: empresaCriada });
    });

    it("deve retornar erro estruturado quando a API rejeitar com erro Axios", async () => {
      const erroAxios = {
        response: {
          status: 400,
          data: {
            title: "Não é possível cadastrar a empresa",
            detail: "Já existe uma empresa com este CNPJ cadastrado.",
          },
        },
      };

      isAxiosErrorMock.mockReturnValue(true);
      requisicaoAutenticadaMock.mockRejectedValue(erroAxios);

      const resultado = await criarEmpresa(PAYLOAD);

      expect(resultado).toEqual({
        success: false,
        error: "api-error",
        title: "Não é possível cadastrar a empresa",
        message: "Já existe uma empresa com este CNPJ cadastrado.",
        status: 400,
      });
    });

    it("deve relançar erros que não forem do Axios", async () => {
      const erro = new Error("Sessão expirada. Faça login novamente.");

      isAxiosErrorMock.mockReturnValue(false);
      requisicaoAutenticadaMock.mockRejectedValue(erro);

      await expect(criarEmpresa(PAYLOAD)).rejects.toThrow(
        "Sessão expirada. Faça login novamente.",
      );
    });
  });

  describe("atualizarEmpresa", () => {
    it("deve chamar requisicaoAutenticada com endpoint e payload corretos e retornar sucesso", async () => {
      const empresaAtualizada = { id: 1, ...PAYLOAD };
      requisicaoAutenticadaMock.mockResolvedValue(empresaAtualizada);

      const resultado = await atualizarEmpresa("uuid-1", PAYLOAD);

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "PUT",
        url: "/empresas/uuid-1",
        data: PAYLOAD,
      });

      expect(resultado).toEqual({
        success: true,
        empresa: empresaAtualizada,
      });
    });

    it("deve retornar erro estruturado quando a API rejeitar com erro Axios", async () => {
      const erroAxios = {
        response: {
          status: 500,
          data: {},
        },
      };

      isAxiosErrorMock.mockReturnValue(true);
      requisicaoAutenticadaMock.mockRejectedValue(erroAxios);

      const resultado = await atualizarEmpresa("uuid-1", PAYLOAD);

      expect(resultado).toEqual({
        success: false,
        error: "api-error",
        title: "Erro",
        message: "Falha no cadastro. Por favor, tente novamente.",
        status: 500,
      });
    });
  });

  describe("listarEmpresas", () => {
    it("deve chamar requisicaoAutenticada com endpoint e parâmetros corretos", async () => {
      const params = {
        nome: "Empresa",
        status: "true",
        page: 1,
        page_size: 10,
      };

      const response = { count: 0, next: null, previous: null, results: [] };

      requisicaoAutenticadaMock.mockResolvedValue(response);

      const resultado = await listarEmpresas(params);

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/empresas",
        params,
      });
      expect(resultado).toEqual(response);
    });

    it("deve propagar o erro da requisição autenticada", async () => {
      const erro = new Error("Erro ao listar empresas");

      requisicaoAutenticadaMock.mockRejectedValue(erro);

      await expect(listarEmpresas({})).rejects.toThrow(
        "Erro ao listar empresas",
      );
    });
  });

  describe("buscarEmpresaPorUuid", () => {
    it("deve chamar requisicaoAutenticada com endpoint correto", async () => {
      const empresa = { id: 1, uuid: "uuid-1", nome: "Empresa" };

      requisicaoAutenticadaMock.mockResolvedValue(empresa);

      const resultado = await buscarEmpresaPorUuid("uuid-1");

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "GET",
        url: "/empresas/uuid-1",
      });
      expect(resultado).toEqual(empresa);
    });
  });
});
