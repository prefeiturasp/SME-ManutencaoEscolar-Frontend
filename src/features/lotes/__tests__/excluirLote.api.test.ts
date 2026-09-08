import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { excluirLote } from "../services/excluirLote.api";

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    isAxiosError: vi.fn(),
  },
}));

const mockRequisicaoAutenticada = vi.mocked(requisicaoAutenticada);
const mockIsAxiosError = vi.mocked(axios.isAxiosError);

describe("excluirLote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve excluir o lote com sucesso", async () => {
    mockRequisicaoAutenticada.mockResolvedValueOnce(undefined);

    const resultado = await excluirLote("uuid-lote");

    expect(mockRequisicaoAutenticada).toHaveBeenCalledTimes(1);
    expect(mockRequisicaoAutenticada).toHaveBeenCalledWith({
      method: "DELETE",
      url: "/lotes/uuid-lote/",
    });

    expect(resultado).toEqual({
      success: true,
    });
  });

  it("deve retornar os dados enviados pela API em um erro Axios", async () => {
    const erro = {
      response: {
        status: 409,
        data: {
          title: "Lote não pode ser excluído",
          message: "O lote possui vínculos ativos.",
        },
      },
    };

    mockRequisicaoAutenticada.mockRejectedValueOnce(erro);
    mockIsAxiosError.mockReturnValueOnce(true);

    const resultado = await excluirLote("uuid-lote");

    expect(mockIsAxiosError).toHaveBeenCalledWith(erro);
    expect(resultado).toEqual({
      success: false,
      status: 409,
      title: "Lote não pode ser excluído",
      message: "O lote possui vínculos ativos.",
    });
  });

  it("deve utilizar detail quando o erro Axios não possuir message", async () => {
    const erro = {
      response: {
        status: 400,
        data: {
          title: "Erro de validação",
          detail: "Não foi possível excluir este lote.",
        },
      },
    };

    mockRequisicaoAutenticada.mockRejectedValueOnce(erro);
    mockIsAxiosError.mockReturnValueOnce(true);

    const resultado = await excluirLote("uuid-lote");

    expect(mockIsAxiosError).toHaveBeenCalledWith(erro);
    expect(resultado).toEqual({
      success: false,
      status: 400,
      title: "Erro de validação",
      message: "Não foi possível excluir este lote.",
    });
  });

  it("deve utilizar os valores padrão quando a resposta Axios não possuir os campos", async () => {
    const erro = {
      response: {
        data: {},
      },
    };

    mockRequisicaoAutenticada.mockRejectedValueOnce(erro);
    mockIsAxiosError.mockReturnValueOnce(true);

    const resultado = await excluirLote("uuid-lote");

    expect(mockIsAxiosError).toHaveBeenCalledWith(erro);
    expect(resultado).toEqual({
      success: false,
      status: 500,
      title: "Erro",
      message: "Não conseguimos excluir o lote. Por favor, tente novamente.",
    });
  });

  it("deve tratar erro Axios sem response", async () => {
    const erro = new Error("Erro de rede");

    mockRequisicaoAutenticada.mockRejectedValueOnce(erro);
    mockIsAxiosError.mockReturnValueOnce(true);

    const resultado = await excluirLote("uuid-lote");

    expect(mockIsAxiosError).toHaveBeenCalledWith(erro);
    expect(resultado).toEqual({
      success: false,
      status: 500,
      title: "Erro",
      message: "Não conseguimos excluir o lote. Por favor, tente novamente.",
    });
  });

  it("deve tratar erros inesperados", async () => {
    const erro = new Error("Erro inesperado");

    mockRequisicaoAutenticada.mockRejectedValueOnce(erro);
    mockIsAxiosError.mockReturnValueOnce(false);

    const resultado = await excluirLote("uuid-lote");

    expect(mockIsAxiosError).toHaveBeenCalledWith(erro);
    expect(resultado).toEqual({
      success: false,
      status: 500,
      title: "Erro",
      message: "Ocorreu um erro inesperado ao excluir o lote.",
    });
  });
});
