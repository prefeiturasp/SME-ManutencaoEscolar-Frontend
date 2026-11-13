import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  alterarSenhaAction: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.useMutation,
}));

vi.mock("@/features/login/services/redefinirSenha", () => ({
  alterarSenhaAction: mocks.alterarSenhaAction,
}));

import { useAlterarSenha } from "../hooks/useRedefinirSenha";

type MutationOptions = {
  mutationFn: typeof mocks.alterarSenhaAction;
  onError: (error: unknown) => void;
};

describe("useAlterarSenha", () => {
  beforeEach(() => {
    mocks.useMutation.mockReset();
    mocks.alterarSenhaAction.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve configurar e retornar a mutation de alteração de senha", () => {
    const retornoMutation = {
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    };

    mocks.useMutation.mockReturnValueOnce(retornoMutation);

    const { result } = renderHook(() => useAlterarSenha());

    expect(result.current).toBe(retornoMutation);
    expect(mocks.useMutation).toHaveBeenCalledTimes(1);

    const options = mocks.useMutation.mock.calls[0][0] as MutationOptions;

    expect(options.mutationFn).toBe(mocks.alterarSenhaAction);
    expect(options.onError).toEqual(expect.any(Function));
  });

  it("deve registrar no console quando a mutation lançar um erro", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    mocks.useMutation.mockReturnValueOnce({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    });

    renderHook(() => useAlterarSenha());

    const options = mocks.useMutation.mock.calls[0][0] as MutationOptions;
    const error = new Error("Erro inesperado");

    options.onError(error);

    expect(consoleError).toHaveBeenCalledTimes(1);

    expect(consoleError).toHaveBeenCalledWith(
      "Erro na mutation de alteração de senha:",
      error,
    );
  });
});
