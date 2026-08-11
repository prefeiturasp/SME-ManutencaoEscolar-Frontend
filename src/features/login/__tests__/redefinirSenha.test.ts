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

import { alterarSenhaAction } from "../services/redefinirSenha";

const credenciais = {
  registro_funcional_ou_cpf: "48801758545",
  token: "token-recuperacao",
  senha: "Abcdef1@",
  confirmacao_senha: "Abcdef1@",
};

describe("alterarSenhaAction", () => {
  beforeEach(() => {
    mocks.post.mockReset();
    mocks.isAxiosError.mockReset();
  });

  it("deve alterar a senha com sucesso", async () => {
    mocks.post.mockResolvedValueOnce({
      data: {
        success: true,
      },
    });

    const resultado = await alterarSenhaAction(credenciais);

    expect(mocks.post).toHaveBeenCalledTimes(1);

    expect(mocks.post).toHaveBeenCalledWith("/alterar-senha/", {
      registro_funcional_ou_cpf: "48801758545",
      token: "token-recuperacao",
      senha: "Abcdef1@",
      confirmacao_senha: "Abcdef1@",
    });

    expect(resultado).toEqual({
      success: true,
    });

    expect(mocks.isAxiosError).not.toHaveBeenCalled();
  });

  it("deve retornar o título e o detalhe enviados pela API", async () => {
    const erroAxios = {
      response: {
        data: {
          title: "O link está expirado!",
          detail: "Solicite um novo link de recuperação.",
        },
      },
    };

    mocks.post.mockRejectedValueOnce(erroAxios);
    mocks.isAxiosError.mockReturnValueOnce(true);

    const resultado = await alterarSenhaAction(credenciais);

    expect(mocks.isAxiosError).toHaveBeenCalledWith(erroAxios);

    expect(resultado).toEqual({
      success: false,
      title: "O link está expirado!",
      detail: "Solicite um novo link de recuperação.",
    });
  });

  it("deve utilizar as mensagens padrões quando a API não enviar dados", async () => {
    const erroAxios = {
      response: {
        data: {},
      },
    };

    mocks.post.mockRejectedValueOnce(erroAxios);
    mocks.isAxiosError.mockReturnValueOnce(true);

    const resultado = await alterarSenhaAction(credenciais);

    expect(resultado).toEqual({
      success: false,
      title: "Não foi possível alterar a senha.",
      detail:
        "O link pode estar inválido ou expirado. Solicite uma nova recuperação.",
    });
  });

  it("deve utilizar as mensagens padrões quando não houver resposta", async () => {
    const erroAxios = {};

    mocks.post.mockRejectedValueOnce(erroAxios);
    mocks.isAxiosError.mockReturnValueOnce(true);

    const resultado = await alterarSenhaAction(credenciais);

    expect(resultado).toEqual({
      success: false,
      title: "Não foi possível alterar a senha.",
      detail:
        "O link pode estar inválido ou expirado. Solicite uma nova recuperação.",
    });
  });

  it("deve tratar erros que não sejam do Axios", async () => {
    const erroGenerico = new Error("Erro inesperado");

    mocks.post.mockRejectedValueOnce(erroGenerico);
    mocks.isAxiosError.mockReturnValueOnce(false);

    const resultado = await alterarSenhaAction(credenciais);

    expect(mocks.isAxiosError).toHaveBeenCalledWith(erroGenerico);

    expect(resultado).toEqual({
      success: false,
      title: "Não foi possível alterar a senha.",
      detail:
        "Parece que estamos com uma instabilidade. Tente novamente em alguns instantes.",
    });
  });
});
