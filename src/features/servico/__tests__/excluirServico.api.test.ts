import { beforeEach, describe, expect, it, vi } from "vitest";

import { excluirServico } from "@/features/servico/services/excluirServico.api";

const { mockIsAxiosError, mockRequisicaoAutenticada } = vi.hoisted(() => ({
  mockIsAxiosError: vi.fn(),
  mockRequisicaoAutenticada: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: mockRequisicaoAutenticada,
}));

vi.mock("axios", () => ({
  default: {
    isAxiosError: mockIsAxiosError,
  },
}));

describe("excluirServico", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAxiosError.mockReturnValue(false);
  });

  it("realiza a requisição DELETE e retorna sucesso", async () => {
    mockRequisicaoAutenticada.mockResolvedValue(undefined);

    const resultado = await excluirServico("servico-123");

    expect(mockRequisicaoAutenticada).toHaveBeenCalledOnce();
    expect(mockRequisicaoAutenticada).toHaveBeenCalledWith({
      method: "DELETE",
      url: "/servicos/servico-123/",
    });

    expect(resultado).toEqual({
      success: true,
    });

    expect(mockIsAxiosError).not.toHaveBeenCalled();
  });

  it("retorna as informações do erro Axios utilizando message", async () => {
    const erroAxios = {
      response: {
        status: 409,
        data: {
          title: "Serviço em uso",
          message: "O serviço possui vínculos.",
        },
      },
    };

    mockRequisicaoAutenticada.mockRejectedValue(erroAxios);
    mockIsAxiosError.mockReturnValue(true);

    const resultado = await excluirServico("servico-123");

    expect(mockIsAxiosError).toHaveBeenCalledWith(erroAxios);

    expect(resultado).toEqual({
      success: false,
      status: 409,
      title: "Serviço em uso",
      message: "O serviço possui vínculos.",
    });
  });

  it("utiliza detail quando o erro Axios não possui message", async () => {
    const erroAxios = {
      response: {
        status: 400,
        data: {
          title: "Erro de validação",
          detail: "Não foi possível excluir o serviço.",
        },
      },
    };

    mockRequisicaoAutenticada.mockRejectedValue(erroAxios);
    mockIsAxiosError.mockReturnValue(true);

    const resultado = await excluirServico("servico-123");

    expect(resultado).toEqual({
      success: false,
      status: 400,
      title: "Erro de validação",
      message: "Não foi possível excluir o serviço.",
    });
  });

  it("utiliza os valores padrão quando o erro Axios não possui response", async () => {
    const erroAxios = new Error("Falha de conexão");

    mockRequisicaoAutenticada.mockRejectedValue(erroAxios);
    mockIsAxiosError.mockReturnValue(true);

    const resultado = await excluirServico("servico-123");

    expect(resultado).toEqual({
      success: false,
      status: 404,
      title: "Erro",
      message: "Não conseguimos excluir. Por favor, tente novamente.",
    });
  });

  it("utiliza a mensagem padrão quando data não possui message nem detail", async () => {
    const erroAxios = {
      response: {
        status: 500,
        data: {
          title: "Erro interno",
        },
      },
    };

    mockRequisicaoAutenticada.mockRejectedValue(erroAxios);
    mockIsAxiosError.mockReturnValue(true);

    const resultado = await excluirServico("servico-123");

    expect(resultado).toEqual({
      success: false,
      status: 500,
      title: "Erro interno",
      message: "Não conseguimos excluir. Por favor, tente novamente.",
    });
  });

  it("retorna erro inesperado quando o erro não é do Axios", async () => {
    const erroInesperado = new Error("Erro desconhecido");

    mockRequisicaoAutenticada.mockRejectedValue(erroInesperado);
    mockIsAxiosError.mockReturnValue(false);

    const resultado = await excluirServico("servico-123");

    expect(mockIsAxiosError).toHaveBeenCalledWith(erroInesperado);

    expect(resultado).toEqual({
      success: false,
      status: 500,
      title: "Erro",
      message: "Ocorreu um erro inesperado ao excluir o serviço.",
    });
  });
});
