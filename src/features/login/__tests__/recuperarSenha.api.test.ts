import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  isAxiosError: vi.fn(),
}));

vi.mock("@/actions/http/client", () => ({
  api: {
    post: mocks.post,
  },
}));

vi.mock("axios", () => ({
  default: {
    isAxiosError: mocks.isAxiosError,
  },
}));

import { recuperarSenhaAction } from "../services/recuperarSenha.api";

describe("recuperarSenhaAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve solicitar a recuperação da senha com sucesso", async () => {
    mocks.post.mockResolvedValue({
      data: {
        email: "mat********@email.com",
      },
    });

    const resultado = await recuperarSenhaAction({
      login: "48801758545",
    });

    expect(mocks.post).toHaveBeenCalledWith("/redefinir-senha/", {
      registro_funcional_ou_cpf: "48801758545",
    });

    expect(resultado).toEqual({
      success: true,
      email: "mat********@email.com",
    });
  });

  it("deve retornar o título e detalhe enviados pela API", async () => {
    const erroApi = {
      response: {
        status: 404,
        data: {
          title: "Usuário não encontrado.",
          detail:
            "Verifique se o RF ou CPF digitados estão corretos e tente novamente.",
        },
      },
    };

    mocks.post.mockRejectedValue(erroApi);
    mocks.isAxiosError.mockReturnValue(true);

    const resultado = await recuperarSenhaAction({
      login: "48801758545",
    });

    expect(mocks.isAxiosError).toHaveBeenCalledWith(erroApi);

    expect(resultado).toEqual({
      success: false,
      title: "Usuário não encontrado.",
      detail:
        "Verifique se o RF ou CPF digitados estão corretos e tente novamente.",
    });
  });

  it("deve retornar mensagens padrão para erro Axios sem dados", async () => {
    const erroApi = {
      response: {
        status: 500,
      },
    };

    mocks.post.mockRejectedValue(erroApi);
    mocks.isAxiosError.mockReturnValue(true);

    const resultado = await recuperarSenhaAction({
      login: "48801758545",
    });

    expect(resultado).toEqual({
      success: false,
      title: "Não foi possível enviar o link.",
      detail: "Verifique os dados informados e tente novamente.",
    });
  });

  it("deve retornar mensagem de instabilidade para erro inesperado", async () => {
    const erroInesperado = new Error("Erro inesperado");

    mocks.post.mockRejectedValue(erroInesperado);
    mocks.isAxiosError.mockReturnValue(false);

    const resultado = await recuperarSenhaAction({
      login: "48801758545",
    });

    expect(mocks.isAxiosError).toHaveBeenCalledWith(erroInesperado);

    expect(resultado).toEqual({
      success: false,
      title: "Não foi possível enviar o link.",
      detail:
        "Parece que estamos com uma instabilidade. Tente novamente em alguns instantes.",
    });
  });
});
