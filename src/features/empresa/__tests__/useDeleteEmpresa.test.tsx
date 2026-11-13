import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeleteEmpresa } from "@/features/empresa/hooks/useDeleteEmpresa";

const mocks = vi.hoisted(() => ({
  deletarEmpresa: vi.fn(),
}));

vi.mock("@/features/empresa/services/empresa.service", () => ({
  deletarEmpresa: mocks.deletarEmpresa,
}));

describe("useDeleteEmpresa", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deletarEmpresa.mockReset();

    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });
  });

  function criarWrapper() {
    return function TestWrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
  }

  it("deve iniciar sem exclusão pendente", () => {
    const { result } = renderHook(() => useDeleteEmpresa("uuid-1"), {
      wrapper: criarWrapper(),
    });

    expect(result.current.isPending).toBe(false);
  });

  it("deve chamar o serviço com o uuid e retornar o sucesso", async () => {
    const resposta = { success: true };

    mocks.deletarEmpresa.mockResolvedValueOnce(resposta);

    const { result } = renderHook(() => useDeleteEmpresa("uuid-1"), {
      wrapper: criarWrapper(),
    });

    await expect(result.current.mutateAsync()).resolves.toEqual(resposta);

    expect(mocks.deletarEmpresa).toHaveBeenCalledExactlyOnceWith("uuid-1");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("deve invalidar listagem e detalhe após sucesso", async () => {
    mocks.deletarEmpresa.mockResolvedValueOnce({ success: true });

    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteEmpresa("uuid-1"), {
      wrapper: criarWrapper(),
    });

    await result.current.mutateAsync();

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["empresas"],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["empresa", "uuid-1"],
      });
    });
  });

  it("deve lançar o resultado completo no erro 400", async () => {
    const resposta = {
      success: false,
      status: 400,
      title: "Não é possível excluir a empresa",
      message: {
        message: "A empresa possui lotes vinculados.",
        vinculados: ["Lote 001", "Lote 002"],
      },
    };

    mocks.deletarEmpresa.mockResolvedValueOnce(resposta);

    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteEmpresa("uuid-1"), {
      wrapper: criarWrapper(),
    });

    await expect(result.current.mutateAsync()).rejects.toEqual(resposta);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it("deve lançar Error com a mensagem da API em falha diferente de 400", async () => {
    mocks.deletarEmpresa.mockResolvedValueOnce({
      success: false,
      status: 500,
      title: "Erro",
      message: "Falha ao excluir a empresa.",
    });

    const { result } = renderHook(() => useDeleteEmpresa("uuid-1"), {
      wrapper: criarWrapper(),
    });

    await expect(result.current.mutateAsync()).rejects.toThrow("Falha ao excluir a empresa.");

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("deve usar a mensagem padrão quando a mensagem não é string", async () => {
    mocks.deletarEmpresa.mockResolvedValueOnce({
      success: false,
      status: 500,
      title: "Erro",
      message: {
        message: "Detalhes em outro formato.",
      },
    });

    const { result } = renderHook(() => useDeleteEmpresa("uuid-1"), {
      wrapper: criarWrapper(),
    });

    await expect(result.current.mutateAsync()).rejects.toThrow(
      "Não conseguimos excluir a empresa. Por favor, tente novamente.",
    );
  });

  it("deve propagar uma exceção lançada pelo serviço", async () => {
    const falha = new Error("Falha de conexão");

    mocks.deletarEmpresa.mockRejectedValueOnce(falha);

    const { result } = renderHook(() => useDeleteEmpresa("uuid-1"), {
      wrapper: criarWrapper(),
    });

    await expect(result.current.mutateAsync()).rejects.toBe(falha);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
