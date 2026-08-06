import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

import {
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/constants/autenticacao";

import { loginAction } from "../services/login.api";

const credenciais = {
  login: "1234567",
  senha: "senha123",
};

const respostaLogin = {
  access: "access-token",
  refresh: "refresh-token",
  usuario: {
    id: 1,
    uuid: "2e7d7d7d-9b8b-4c92-9b3b-123456789abc",
    nome: "Mário de Almeida Silva",
    email: "fulano@email.com",
    registro_funcional: "1234567",
    cpf: "12345678901",
    username: "1234567",
    perfil_acesso: {
      cargo: "DIRETOR DE ESCOLA",
      perfil: {
        codigo: "UE",
        descricao: "Diretor Unidade Educacional",
      },
    },
    diretoria_regional: null,
    unidade_educacional: null,
  },
};

const usuarioEsperado = {
  id: 1,
  uuid: "2e7d7d7d-9b8b-4c92-9b3b-123456789abc",
  nome: "Mário de Almeida Silva",
  email: "fulano@email.com",
  codigoRfOuCpf: "1234567",
  registroFuncional: "1234567",
  cpf: "12345678901",
  cargo: "DIRETOR DE ESCOLA",
  perfil: {
    codigo: "UE",
    descricao: "Diretor Unidade Educacional",
  },
  diretoriaRegional: null,
  unidadeEducacional: null,
};

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");

    cookiesMock.mockResolvedValue({
      set: setCookieMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("deve realizar o login e criar os cookies dos tokens", async () => {
    postMock.mockResolvedValue({
      data: respostaLogin,
    });

    const resultado = await loginAction(credenciais);

    expect(postMock).toHaveBeenCalledOnce();
    expect(postMock).toHaveBeenCalledWith("/login/", credenciais);

    expect(cookiesMock).toHaveBeenCalledOnce();

    expect(setCookieMock).toHaveBeenCalledTimes(2);

    expect(setCookieMock).toHaveBeenNthCalledWith(
      1,
      "accessToken",
      "access-token",
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE,
      },
    );

    expect(setCookieMock).toHaveBeenNthCalledWith(
      2,
      "refreshToken",
      "refresh-token",
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE,
      },
    );

    expect(resultado).toEqual({
      success: true,
      user: usuarioEsperado,
    });
  });

  it("deve criar cookies seguros em produção", async () => {
    vi.stubEnv("NODE_ENV", "production");

    postMock.mockResolvedValue({
      data: respostaLogin,
    });

    await loginAction(credenciais);

    expect(setCookieMock).toHaveBeenNthCalledWith(
      1,
      "accessToken",
      "access-token",
      expect.objectContaining({
        secure: true,
      }),
    );

    expect(setCookieMock).toHaveBeenNthCalledWith(
      2,
      "refreshToken",
      "refresh-token",
      expect.objectContaining({
        secure: true,
      }),
    );
  });

  it("deve retornar a mensagem do campo login", async () => {
    postMock.mockRejectedValue({
      response: {
        status: 400,
        data: {
          login: ["Login inválido."],
        },
      },
    });

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = await loginAction(credenciais);

    expect(resultado).toEqual({
      success: false,
      error: "Login inválido.",
    });

    expect(cookiesMock).not.toHaveBeenCalled();
    expect(setCookieMock).not.toHaveBeenCalled();
  });

  it("deve retornar a mensagem do campo senha", async () => {
    postMock.mockRejectedValue({
      response: {
        status: 400,
        data: {
          senha: ["Senha inválida."],
        },
      },
    });

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = await loginAction(credenciais);

    expect(resultado).toEqual({
      success: false,
      error: "Senha inválida.",
    });
  });

  it("deve retornar a mensagem detail", async () => {
    postMock.mockRejectedValue({
      response: {
        status: 401,
        data: {
          detail: "Credenciais inválidas.",
        },
      },
    });

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = await loginAction(credenciais);

    expect(resultado).toEqual({
      success: false,
      error: "Credenciais inválidas.",
    });
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

    const resultado = await loginAction(credenciais);

    expect(resultado).toEqual({
      success: false,
      error: "Não foi possível realizar o login.",
    });
  });

  it("deve priorizar login sobre as demais mensagens", async () => {
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

    const resultado = await loginAction(credenciais);

    expect(resultado).toEqual({
      success: false,
      error: "Login inválido.",
    });
  });

  it("deve retornar a mensagem padrão para erro Axios sem data", async () => {
    postMock.mockRejectedValue({
      response: {
        status: 500,
      },
    });

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = await loginAction(credenciais);

    expect(resultado).toEqual({
      success: false,
      error: "Os dados informados são inválidos.",
    });

    expect(setCookieMock).not.toHaveBeenCalled();
  });

  it("deve retornar a mensagem padrão para erro Axios sem response", async () => {
    postMock.mockRejectedValue({
      message: "Network Error",
    });

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = await loginAction(credenciais);

    expect(resultado).toEqual({
      success: false,
      error: "Os dados informados são inválidos.",
    });

    expect(setCookieMock).not.toHaveBeenCalled();
  });

  it("deve retornar mensagem de instabilidade para erro inesperado", async () => {
    postMock.mockRejectedValue(new Error("Erro inesperado"));

    vi.spyOn(axios, "isAxiosError").mockReturnValue(false);

    const resultado = await loginAction(credenciais);

    expect(resultado).toEqual({
      success: false,
      error:
        "Parece que estamos com uma instabilidade. Tente novamente em alguns instantes.",
    });

    expect(cookiesMock).not.toHaveBeenCalled();
    expect(setCookieMock).not.toHaveBeenCalled();
  });
});
