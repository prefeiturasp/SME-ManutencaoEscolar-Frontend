import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  recuperarSenhaAction: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.useMutation,
}));

vi.mock("@/features/login/services/recuperarSenha.api", () => ({
  recuperarSenhaAction: mocks.recuperarSenhaAction,
}));

import { useRecuperarSenha } from "../hooks/useRecuperarSenha";

type MutationOptions = {
  mutationFn: typeof mocks.recuperarSenhaAction;
  onError: (error: Error) => void;
};

describe("useRecuperarSenha", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useMutation.mockImplementation((opcoes: MutationOptions) => opcoes);
  });

  it("deve configurar a mutation com a action de recuperação", () => {
    const resultado = useRecuperarSenha() as unknown as MutationOptions;

    expect(mocks.useMutation).toHaveBeenCalledTimes(1);

    expect(resultado.mutationFn).toBe(mocks.recuperarSenhaAction);
  });

  it("deve registrar o erro ocorrido na mutation", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const resultado = useRecuperarSenha() as unknown as MutationOptions;

    const erro = new Error("Falha na recuperação");

    resultado.onError(erro);

    expect(consoleError).toHaveBeenCalledWith(
      "Erro na mutation de recuperação de senha:",
      erro,
    );

    consoleError.mockRestore();
  });
});
