import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ServiceFormData } from "../schemas/servicoSchema";
import { editarServicoAction } from "../services/editarServico";

const mocks = vi.hoisted(() => ({
  requisicaoAutenticada: vi.fn(),
  isAxiosError: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: mocks.requisicaoAutenticada,
}));

vi.mock("axios", () => ({
  default: {
    isAxiosError: mocks.isAxiosError,
  },
}));

const uuid = "07f14275-59ee-4e67-812a-d5aaa2cedb62";

describe("editarServicoAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isAxiosError.mockReturnValue(false);
  });

  it("deve editar um serviço ativo", async () => {
    const dados: ServiceFormData = {
      nome: "Pintura externa",
      status: "true",
    };

    mocks.requisicaoAutenticada.mockResolvedValue(undefined);

    const resultado = await editarServicoAction({
      uuid,
      dados,
    });

    expect(mocks.requisicaoAutenticada).toHaveBeenCalledTimes(1);

    expect(mocks.requisicaoAutenticada).toHaveBeenCalledWith({
      method: "PATCH",
      url: `/servicos/${uuid}/`,
      data: {
        nome: "Pintura externa",
        status: true,
      },
    });

    expect(resultado).toEqual({
      success: true,
    });
  });

  it("deve editar um serviço inativo", async () => {
    const dados: ServiceFormData = {
      nome: "Pintura interna",
      status: "false",
    };

    mocks.requisicaoAutenticada.mockResolvedValue(undefined);

    const resultado = await editarServicoAction({
      uuid,
      dados,
    });

    expect(mocks.requisicaoAutenticada).toHaveBeenCalledWith({
      method: "PATCH",
      url: `/servicos/${uuid}/`,
      data: {
        nome: "Pintura interna",
        status: false,
      },
    });

    expect(resultado).toEqual({
      success: true,
    });
  });

  it("deve retornar o erro recebido da API", async () => {
    const dados: ServiceFormData = {
      nome: "Pintura",
      status: "true",
    };

    const error = {
      response: {
        status: 400,
        data: {
          title: "Serviço já cadastrado",
          message: "Já existe um serviço com esse nome.",
        },
      },
    };

    mocks.requisicaoAutenticada.mockRejectedValue(error);
    mocks.isAxiosError.mockReturnValue(true);

    const resultado = await editarServicoAction({
      uuid,
      dados,
    });

    expect(mocks.isAxiosError).toHaveBeenCalledWith(error);

    expect(resultado).toEqual({
      success: false,
      status: 400,
      title: "Serviço já cadastrado",
      message: "Já existe um serviço com esse nome.",
    });
  });

  it("deve utilizar os valores padrão quando o erro Axios não tiver resposta", async () => {
    const dados: ServiceFormData = {
      nome: "Pintura",
      status: "true",
    };

    const error = {
      message: "Network Error",
    };

    mocks.requisicaoAutenticada.mockRejectedValue(error);
    mocks.isAxiosError.mockReturnValue(true);

    const resultado = await editarServicoAction({
      uuid,
      dados,
    });

    expect(mocks.isAxiosError).toHaveBeenCalledWith(error);

    expect(resultado).toEqual({
      success: false,
      status: 500,
      title: "Erro",
      message:
        "Não conseguimos salvar as alterações. Por favor, tente novamente.",
    });
  });

  it("deve utilizar os valores padrão quando a resposta não tiver detalhes", async () => {
    const dados: ServiceFormData = {
      nome: "Pintura",
      status: "true",
    };

    const error = {
      response: {
        status: undefined,
        data: {},
      },
    };

    mocks.requisicaoAutenticada.mockRejectedValue(error);
    mocks.isAxiosError.mockReturnValue(true);

    const resultado = await editarServicoAction({
      uuid,
      dados,
    });

    expect(resultado).toEqual({
      success: false,
      status: 500,
      title: "Erro",
      message:
        "Não conseguimos salvar as alterações. Por favor, tente novamente.",
    });
  });

  it("deve tratar um erro inesperado que não seja do Axios", async () => {
    const dados: ServiceFormData = {
      nome: "Pintura",
      status: "true",
    };

    const error = new Error("Erro inesperado");

    mocks.requisicaoAutenticada.mockRejectedValue(error);
    mocks.isAxiosError.mockReturnValue(false);

    const resultado = await editarServicoAction({
      uuid,
      dados,
    });

    expect(mocks.isAxiosError).toHaveBeenCalledWith(error);

    expect(resultado).toEqual({
      success: false,
      status: 500,
      title: "Erro",
      message: "Ocorreu um erro inesperado ao editar o serviço.",
    });
  });
});
