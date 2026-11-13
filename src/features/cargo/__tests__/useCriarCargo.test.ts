import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

type ResultadoCriarCargo =
  | {
      success: true;
      cargo: {
        id: number;
        nome: string;
      };
    }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      status?: number;
    };

type MutationOptions = {
  mutationFn: typeof criarCargoMock;
  meta: {
    loading: {
      titulo: string;
      mensagem: string;
    };
  };
  onSuccess: (resultado: ResultadoCriarCargo) => Promise<void>;
  onError: (error: unknown) => void;
};

const {
  criarCargoMock,
  invalidateQueriesMock,
  replaceMock,
  useMutationMock,
  useQueryClientMock,
  useRouterMock,
} = vi.hoisted(() => ({
  criarCargoMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  replaceMock: vi.fn(),
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  useRouterMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: useRouterMock,
}));

vi.mock("@/features/cargo/services/criarCargo.api", () => ({
  criarCargo: criarCargoMock,
}));

import { useCriarCargo } from "@/features/cargo/hooks/useCriarCargo";

describe("useCriarCargo", () => {
  let mutationOptions: MutationOptions;

  const mutationResult = {
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    invalidateQueriesMock.mockResolvedValue(undefined);

    useRouterMock.mockReturnValue({
      replace: replaceMock,
    });

    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });

    useMutationMock.mockImplementation((options: MutationOptions) => {
      mutationOptions = options;

      return mutationResult;
    });
  });

  it("configura e retorna a mutation de criação de cargo", () => {
    const { result } = renderHook(() => useCriarCargo());

    expect(useRouterMock).toHaveBeenCalledOnce();
    expect(useQueryClientMock).toHaveBeenCalledOnce();
    expect(useMutationMock).toHaveBeenCalledOnce();

    expect(mutationOptions.mutationFn).toBe(criarCargoMock);

    expect(mutationOptions.meta).toEqual({
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos cadastrando o cargo...",
      },
    });

    expect(result.current).toBe(mutationResult);
  });

  it("invalida a listagem e redireciona após criar com sucesso", async () => {
    renderHook(() => useCriarCargo());

    await act(async () => {
      await mutationOptions.onSuccess({
        success: true,
        cargo: {
          id: 1,
          nome: "Eletricista",
        },
      });
    });

    expect(invalidateQueriesMock).toHaveBeenCalledOnce();
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ["cargos"],
    });

    expect(replaceMock).toHaveBeenCalledOnce();
    expect(replaceMock).toHaveBeenCalledWith("/cargos");
  });

  it("não invalida nem redireciona quando a API retorna falha", async () => {
    renderHook(() => useCriarCargo());

    await act(async () => {
      await mutationOptions.onSuccess({
        success: false,
        error: "api-error",
        title: "Cargo já cadastrado",
        message: "Já existe um cargo com este nome.",
        status: 400,
      });
    });

    expect(invalidateQueriesMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("registra no console um erro inesperado da mutation", () => {
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    renderHook(() => useCriarCargo());

    const error = new Error("Falha inesperada");

    act(() => {
      mutationOptions.onError(error);
    });

    expect(consoleErrorMock).toHaveBeenCalledOnce();
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Erro ao criar cargo:",
      error,
    );

    expect(invalidateQueriesMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();

    consoleErrorMock.mockRestore();
  });
});
