import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CriarLoteResultado } from "@/features/lotes/types/lotes.types";

import { useCriarLote } from "@/features/lotes/hooks/useCriarLote";
import { criarLoteAction } from "@/features/lotes/services/criarLote.api";

const {
  useMutationMock,
  useQueryClientMock,
  useRouterMock,
  invalidateQueriesMock,
  replaceMock,
  criarLoteActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  useRouterMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  replaceMock: vi.fn(),
  criarLoteActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: useRouterMock,
}));

vi.mock("@/features/lotes/services/criarLote.api", () => ({
  criarLoteAction: criarLoteActionMock,
}));

type OpcoesMutacao = {
  mutationFn: typeof criarLoteAction;
  meta: {
    loading: {
      titulo: string;
      mensagem: string;
    };
  };
  onSuccess: (resultado: CriarLoteResultado) => Promise<void> | void;
  onError: (error: unknown) => void;
};

function obterOpcoesMutacao(): OpcoesMutacao {
  return useMutationMock.mock.calls[0][0] as OpcoesMutacao;
}

describe("useCriarLote", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    invalidateQueriesMock.mockResolvedValue(undefined);

    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });

    useRouterMock.mockReturnValue({
      replace: replaceMock,
    });

    useMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it("configura a mutation com a action de criação do lote", () => {
    renderHook(() => useCriarLote());

    const opcoes = obterOpcoesMutacao();

    expect(opcoes.mutationFn).toBe(criarLoteActionMock);

    expect(opcoes.meta).toEqual({
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos cadastrando o lote...",
      },
    });
  });

  it("invalida a listagem e redireciona após criar o lote", async () => {
    renderHook(() => useCriarLote());

    const opcoes = obterOpcoesMutacao();

    await act(async () => {
      await opcoes.onSuccess({
        success: true,
      } as CriarLoteResultado);
    });

    expect(invalidateQueriesMock).toHaveBeenCalledTimes(1);

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ["lotes"],
    });

    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/lotes");
  });

  it("não invalida nem redireciona quando a criação falha", async () => {
    renderHook(() => useCriarLote());

    const opcoes = obterOpcoesMutacao();

    await act(async () => {
      await opcoes.onSuccess({
        success: false,
        status: 400,
        title: "Erro",
        message: "Não foi possível criar o lote.",
      } as CriarLoteResultado);
    });

    expect(invalidateQueriesMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("registra no console quando ocorre um erro inesperado", () => {
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    renderHook(() => useCriarLote());

    const opcoes = obterOpcoesMutacao();
    const error = new Error("Erro inesperado");

    act(() => {
      opcoes.onError(error);
    });

    expect(consoleErrorMock).toHaveBeenCalledTimes(1);

    expect(consoleErrorMock).toHaveBeenCalledWith("Erro ao criar lote:", error);

    consoleErrorMock.mockRestore();
  });
});
