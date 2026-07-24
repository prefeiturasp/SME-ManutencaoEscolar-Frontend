import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";

import { criarServicoAction } from "../services/servico.api";

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    isAxiosError: vi.fn(),
  },
}));

describe("criarServicoAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.isAxiosError).mockReturnValue(false);
  });

  it("deve converter e enviar os dados corretamente para a API", async () => {
    vi.mocked(requisicaoAutenticada).mockResolvedValue({
      id: 1,
      uuid: "uuid-servico",
      nome: "Jardinagem",
      status: true,
    });

    await criarServicoAction({
      service_name: "Jardinagem",
      status: "ativo",
    });

    expect(requisicaoAutenticada).toHaveBeenCalledTimes(1);

    expect(requisicaoAutenticada).toHaveBeenCalledWith({
      method: "POST",
      url: "/api/v1/servicos/",
      data: {
        nome: "Jardinagem",
        status: true,
      },
    });
  });

  it("deve converter status inativo para false", async () => {
    vi.mocked(requisicaoAutenticada).mockResolvedValue({
      id: 2,
      uuid: "outro-uuid",
      nome: "Elétrica",
      status: false,
    });

    await criarServicoAction({
      service_name: "Elétrica",
      status: "inativo",
    });

    expect(requisicaoAutenticada).toHaveBeenCalledWith({
      method: "POST",
      url: "/api/v1/servicos/",
      data: {
        nome: "Elétrica",
        status: false,
      },
    });
  });

  it("deve retornar sucesso com o serviço criado", async () => {
    const servicoCriado = {
      id: 1,
      uuid: "uuid-servico",
      nome: "Pintura",
      status: true,
    };

    vi.mocked(requisicaoAutenticada).mockResolvedValue(servicoCriado);

    const resultado = await criarServicoAction({
      service_name: "Pintura",
      status: "ativo",
    });

    expect(resultado).toEqual({
      success: true,
      service: servicoCriado,
    });
  });

  it("deve retornar os dados enviados pela API em um erro Axios", async () => {
    const erroAxios = {
      response: {
        status: 400,
        data: {
          title: "Não é possível criar o serviço",
          detail: "Já existe um serviço com este nome cadastrado no sistema.",
        },
      },
    };

    vi.mocked(axios.isAxiosError).mockReturnValue(true);
    vi.mocked(requisicaoAutenticada).mockRejectedValue(erroAxios);

    const resultado = await criarServicoAction({
      service_name: "Pintura",
      status: "ativo",
    });

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Não é possível criar o serviço",
      message: "Já existe um serviço com este nome cadastrado no sistema.",
      status: 400,
    });
  });

  it("deve utilizar o erro do campo nome quando detail não existir", async () => {
    const erroAxios = {
      response: {
        status: 400,
        data: {
          nome: ["Serviço com este nome já existe."],
        },
      },
    };

    vi.mocked(axios.isAxiosError).mockReturnValue(true);
    vi.mocked(requisicaoAutenticada).mockRejectedValue(erroAxios);

    const resultado = await criarServicoAction({
      service_name: "Jardinagem",
      status: "ativo",
    });

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Serviço com este nome já existe.",
      status: 400,
    });
  });

  it("deve utilizar mensagens padrão quando a API não retornar detalhes", async () => {
    const erroAxios = {
      response: {
        status: 500,
        data: {},
      },
    };

    vi.mocked(axios.isAxiosError).mockReturnValue(true);
    vi.mocked(requisicaoAutenticada).mockRejectedValue(erroAxios);

    const resultado = await criarServicoAction({
      service_name: "Hidráulica",
      status: "ativo",
    });

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Erro não identificado.",
      status: 500,
    });
  });

  it("deve relançar erros que não forem do Axios", async () => {
    const erro = new Error("Falha inesperada");

    vi.mocked(axios.isAxiosError).mockReturnValue(false);
    vi.mocked(requisicaoAutenticada).mockRejectedValue(erro);

    await expect(
      criarServicoAction({
        service_name: "Hidráulica",
        status: "ativo",
      }),
    ).rejects.toThrow("Falha inesperada");
  });
});
