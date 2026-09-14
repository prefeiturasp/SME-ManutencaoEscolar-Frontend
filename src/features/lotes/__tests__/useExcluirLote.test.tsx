import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useExcluirLote } from "../hooks/useDeleteLote";
import { excluirLote } from "../services/excluirLote.api";

vi.mock("../services/excluirLote.api", () => ({
  excluirLote: vi.fn(),
}));

const mockExcluirLote = vi.mocked(excluirLote);

describe("useExcluirLote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function prepararHook(uuid = "uuid-lote") {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    const invalidateQueriesSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);

    function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    }

    const hook = renderHook(() => useExcluirLote(uuid), {
      wrapper: Wrapper,
    });

    return {
      ...hook,
      queryClient,
      invalidateQueriesSpy,
    };
  }

  it("deve excluir o lote e invalidar as consultas relacionadas", async () => {
    mockExcluirLote.mockResolvedValueOnce({
      success: true,
    });

    const { result, invalidateQueriesSpy } = prepararHook("uuid-lote-1");

    let resultado;

    await act(async () => {
      resultado = await result.current.mutateAsync();
    });

    expect(mockExcluirLote).toHaveBeenCalledTimes(1);
    expect(mockExcluirLote).toHaveBeenCalledWith("uuid-lote-1");

    expect(resultado).toEqual({
      success: true,
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
    expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(1, {
      queryKey: ["lotes"],
    });
    expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(2, {
      queryKey: ["lotes", "uuid-lote-1"],
    });
  });

  it("deve lançar erro quando a exclusão não funcionar", async () => {
    mockExcluirLote.mockResolvedValueOnce({
      success: false,
      status: 400,
      title: "Erro ao excluir",
      message: "Não foi possível excluir o lote.",
    });

    const { result, invalidateQueriesSpy } = prepararHook("uuid-lote-2");

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow(
        "Não foi possível excluir o lote.",
      );
    });

    expect(mockExcluirLote).toHaveBeenCalledTimes(1);
    expect(mockExcluirLote).toHaveBeenCalledWith("uuid-lote-2");

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it("deve configurar as informações de carregamento da mutation", async () => {
    mockExcluirLote.mockResolvedValueOnce({
      success: true,
    });

    const { result, queryClient } = prepararHook();

    await act(async () => {
      await result.current.mutateAsync();
    });

    const mutation = queryClient.getMutationCache().getAll()[0];

    expect(mutation.options.meta).toEqual({
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos excluindo o serviço...",
      },
    });
  });
});
