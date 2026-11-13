import { useMutation } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { useLogin } from "../hooks/useLogin";
import { loginAction } from "../services/login.api";

const replaceMock = vi.fn();
const definirUsuarioMock = vi.fn();

vi.mock("../services/login.api", () => ({
  loginAction: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/stores/useUsuarioStore", () => ({
  useUsuarioStore: vi.fn(),
}));

describe("useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUsuarioStore).mockImplementation((seletor) =>
      seletor({
        usuario: null,
        definirUsuario: definirUsuarioMock,
        limparUsuario: vi.fn(),
      }),
    );

    vi.mocked(useMutation).mockReturnValue(
      {} as ReturnType<typeof useMutation>,
    );
  });

  it("deve configurar a mutation com loginAction", () => {
    renderHook(() => useLogin());

    expect(useMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationFn: loginAction,
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("deve salvar o usuário e redirecionar quando o login for bem-sucedido", () => {
    renderHook(() => useLogin());

    const configuracaoMutation = vi.mocked(useMutation).mock.calls[0][0];

    const usuario = {
      nome: "Mário de Almeida Silva",
      codigoRfOuCpf: "1234567",
      cargo: "Fornecedor",
      diretoriaRegional: null,
      unidadeEducacional: null,
    };

    configuracaoMutation.onSuccess?.(
      {
        success: true,
        user: usuario,
      },
      {
        login: "1234567",
        senha: "senha123",
      },
      undefined,
      {} as never,
    );

    expect(definirUsuarioMock).toHaveBeenCalledWith(usuario);
    expect(replaceMock).toHaveBeenCalledWith("/");
  });

  it("não deve salvar usuário nem redirecionar quando o login falhar", () => {
    renderHook(() => useLogin());

    const configuracaoMutation = vi.mocked(useMutation).mock.calls[0][0];

    configuracaoMutation.onSuccess?.(
      {
        success: false,
        error: "Usuário e/ou senha inválidos.",
      },
      {
        login: "1234567",
        senha: "senha123",
      },
      undefined,
      {} as never,
    );

    expect(definirUsuarioMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve registrar erro quando a mutation falhar", () => {
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    renderHook(() => useLogin());

    const configuracaoMutation = vi.mocked(useMutation).mock.calls[0][0];

    const erro = new Error("Erro inesperado");

    configuracaoMutation.onError?.(
      erro,
      {
        login: "1234567",
        senha: "senha123",
      },
      undefined,
      {} as never,
    );

    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Erro na mutation de login:",
      erro,
    );

    consoleErrorMock.mockRestore();
  });
});
