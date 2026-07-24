import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { postMock, setCookieMock, cookiesMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
  setCookieMock: vi.fn(),
  cookiesMock: vi.fn(),
}));

vi.mock("@/actions/http/client", () => ({
  api: {
    post: postMock,
  },
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

import { loginAction } from "../services/login.api";

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    cookiesMock.mockResolvedValue({
      set: setCookieMock,
    });
  });

  it("deve realizar o login e criar o cookie de autenticação", async () => {
    postMock.mockResolvedValue({
      data: {
        access: "access-token",
        refresh: "refresh-token",
        usuario: {
          id: 1,
          uuid: "2e7d7d7d-9b8b-4c92-9b3b-123456789abc",
          nome: "Mário de Almeida Silva",
          email: "fulano@emial.com",
          registro_funcional: "1234567",
          cpf: "12345678901",
          username: "1234567",
          perfil_acesso: {
            cargo: "DIRETOR DE ESCOLA",
            perfil: {
              codigo: "UE",
              descricao: "Diretor Unidade Educacional"
            }
          },
          diretoria_regional: null,
          unidade_educacional: null,
        },
      },
    });

    const resultado = await loginAction({
      login: "1234567",
      senha: "senha123",
    });

    const usuarioEsperado = {
          id: 1,
          uuid: "2e7d7d7d-9b8b-4c92-9b3b-123456789abc",
          nome: "Mário de Almeida Silva",
          email: "fulano@emial.com",
          registroFuncional: "1234567",
          cpf: "12345678901",
          codigoRfOuCpf: "1234567",
          cargo: "DIRETOR DE ESCOLA",
          perfil: {
              codigo: "UE",
              descricao: "Diretor Unidade Educacional"
            },
          diretoriaRegional: null,
          unidadeEducacional: null,
      };

    expect(postMock).toHaveBeenCalledWith("/api/v1/login/", {
      login: "1234567",
      senha: "senha123",
    });

    expect(cookiesMock).toHaveBeenCalledTimes(1);

    expect(setCookieMock).toHaveBeenCalledTimes(1);

    expect(setCookieMock).toHaveBeenCalledWith("accessToken", "access-token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    expect(resultado).toEqual({
      success: true,
      user: usuarioEsperado,
    });
  });

  it("deve retornar a mensagem detail da API", async () => {
    postMock.mockRejectedValue({
      response: {
        status: 401,
        data: {
          detail: "Credenciais inválidas.",
        },
      },
    });

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = await loginAction({
      login: "1234567",
      senha: "senha123",
    });

    expect(resultado).toEqual({
      success: false,
      error: "Credenciais inválidas.",
    });

    expect(setCookieMock).not.toHaveBeenCalled();
  });

  it("deve retornar a mensagem do campo login", async () => {
    postMock.mockRejectedValue({
      response: {
        status: 400,
        data: {
          login: [
            "Certifique-se de que este campo não tenha mais de 11 caracteres.",
          ],
        },
      },
    });

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = await loginAction({
      login: "123456789012",
      senha: "senha123",
    });

    expect(resultado).toEqual({
      success: false,
      error: "Certifique-se de que este campo não tenha mais de 11 caracteres.",
    });

    expect(setCookieMock).not.toHaveBeenCalled();
  });

  it("deve retornar a mensagem do campo senha", async () => {
    postMock.mockRejectedValue({
      response: {
        status: 400,
        data: {
          senha: ["A senha informada é inválida."],
        },
      },
    });

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = await loginAction({
      login: "1234567",
      senha: "senha-invalida",
    });

    expect(resultado).toEqual({
      success: false,
      error: "A senha informada é inválida.",
    });

    expect(setCookieMock).not.toHaveBeenCalled();
  });

  it("deve retornar a mensagem do campo message", async () => {
    postMock.mockRejectedValue({
      response: {
        status: 400,
        data: {
          message: "Não foi possível realizar o login.",
        },
      },
    });

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = await loginAction({
      login: "1234567",
      senha: "senha123",
    });

    expect(resultado).toEqual({
      success: false,
      error: "Não foi possível realizar o login.",
    });

    expect(setCookieMock).not.toHaveBeenCalled();
  });

  it("deve priorizar a mensagem do campo login", async () => {
    postMock.mockRejectedValue({
      response: {
        status: 400,
        data: {
          login: ["Login inválido."],
          senha: ["Senha inválida."],
          detail: "Dados inválidos.",
          message: "Erro no login.",
        },
      },
    });

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = await loginAction({
      login: "1234567",
      senha: "senha123",
    });

    expect(resultado).toEqual({
      success: false,
      error: "Login inválido.",
    });

    expect(setCookieMock).not.toHaveBeenCalled();
  });

  it("deve retornar mensagem padrão para erro Axios sem body", async () => {
    postMock.mockRejectedValue({
      response: {
        status: 500,
      },
    });

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = await loginAction({
      login: "1234567",
      senha: "senha123",
    });

    expect(resultado).toEqual({
      success: false,
      error: "Os dados informados são inválidos.",
    });

    expect(setCookieMock).not.toHaveBeenCalled();
  });

  it("deve retornar mensagem de instabilidade para erro inesperado", async () => {
    postMock.mockRejectedValue(new Error("Erro inesperado"));

    vi.spyOn(axios, "isAxiosError").mockReturnValue(false);

    const resultado = await loginAction({
      login: "1234567",
      senha: "senha123",
    });

    expect(resultado).toEqual({
      success: false,
      error:
        "Parece que estamos com uma instabilidade. Tente novamente em alguns instantes.",
    });

    expect(setCookieMock).not.toHaveBeenCalled();
  });
});
