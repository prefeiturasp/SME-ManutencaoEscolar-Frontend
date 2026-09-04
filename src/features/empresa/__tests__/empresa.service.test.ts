import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  atualizarEmpresa,
  buscarEmpresaPorUuid,
  criarEmpresa,
  deletarEmpresa,
  listarEmpresas,
} from "@/features/empresa/services/empresa.service";
import type { EmpresaFormValues } from "@/features/empresa/types/empresa.types";

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
  responsaveis_tecnicos: [],
};

function entradasFormData(formData: FormData) {
  return Array.from(formData.entries());
}

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

    it("deve serializar empresa, responsáveis e anexos como multipart", async () => {
      const arquivo = new File(["crea"], "crea.pdf", {
        type: "application/pdf",
      });
      requisicaoAutenticadaMock.mockResolvedValue({ id: 1 });

      await criarEmpresa({
        ...PAYLOAD,
        status: false,
        numero: 0 as unknown as string,
        complemento: "",
        responsaveis_tecnicos: [
          {
            nome: "Responsável",
            telefone: "11999999999",
            email: "responsavel@example.com",
            tipo: "engenheiro_civil",
            numero_crea: "123",
            numero_art: "456",
            anexos: [arquivo, { uuid: "anexo-existente", nome: "ART.pdf" }],
          },
        ],
      } satisfies EmpresaFormValues);

      const chamada = requisicaoAutenticadaMock.mock.calls[0][0];
      expect(chamada).toMatchObject({
        method: "POST",
        url: "/empresas",
        headers: { "Content-Type": "multipart/form-data" },
      });
      expect(entradasFormData(chamada.data)).toEqual(
        expect.arrayContaining([
          ["nome", "Empresa"],
          ["status", "false"],
          ["numero", "0"],
          ["responsaveis_tecnicos[0]nome", "Responsável"],
          ["responsaveis_tecnicos[0]arquivos[0]", arquivo],
          [
            "responsaveis_tecnicos[0]arquivos[1]uuid",
            "anexo-existente",
          ],
        ]),
      );
      expect(chamada.data.has("complemento")).toBe(false);
    });

    it("deve converter anexos ausentes em uma lista vazia no payload JSON", async () => {
      requisicaoAutenticadaMock.mockResolvedValue({ id: 1 });

      await criarEmpresa({
        ...PAYLOAD,
        responsaveis_tecnicos: [
          {
            nome: "Preposto",
            telefone: "11999999999",
            email: "preposto@example.com",
            tipo: "preposto",
          },
        ],
      });

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            responsaveis_tecnicos: [
              expect.objectContaining({ arquivos: [] }),
            ],
          }),
        }),
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

  describe("deletarEmpresa", () => {
    it("deve chamar requisicaoAutenticada com endpoint correto e retornar sucesso", async () => {
      const empresaExcluida = { id: 1, uuid: "uuid-1", ...PAYLOAD };
      requisicaoAutenticadaMock.mockResolvedValue(empresaExcluida);

      const resultado = await deletarEmpresa("uuid-1");

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "DELETE",
        url: "/empresas/uuid-1",
      });

      expect(resultado).toEqual({ success: true, empresa: empresaExcluida });
    });

    it("deve retornar erro estruturado quando a API rejeitar com erro Axios", async () => {
      const erroAxios = {
        response: {
          status: 400,
          data: {
            title: "Não é possível excluir a empresa",
            detail: "Empresa possui vínculos ativos.",
          },
        },
      };

      isAxiosErrorMock.mockReturnValue(true);
      requisicaoAutenticadaMock.mockRejectedValue(erroAxios);

      const resultado = await deletarEmpresa("uuid-1");

      expect(resultado).toEqual({
        success: false,
        error: "api-error",
        title: "Não é possível excluir a empresa",
        message: "Empresa possui vínculos ativos.",
        status: 400,
      });
    });

    it("deve relançar erros que não forem do Axios", async () => {
      const erro = new Error("Sessão expirada. Faça login novamente.");

      isAxiosErrorMock.mockReturnValue(false);
      requisicaoAutenticadaMock.mockRejectedValue(erro);

      await expect(deletarEmpresa("uuid-1")).rejects.toThrow(
        "Sessão expirada. Faça login novamente.",
      );
    });
  });
});
