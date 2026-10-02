import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeleteProfissional } from "@/features/profissional/hooks/useDeleteProfissional";

const mocks = vi.hoisted(() => ({
  deletarProfissional: vi.fn(),
}));

vi.mock("@/features/profissional/services/profissional.service", () => ({
  deletarProfissional: mocks.deletarProfissional,
}));

describe("useDeleteProfissional", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });
  });

  function criarWrapper() {
    return function TestWrapper({ children }: Readonly<{ children: ReactNode }>) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
  }

  it("chama o serviço com o UUID", async () => {
    const resposta = { success: true };
    mocks.deletarProfissional.mockResolvedValueOnce(resposta);

    const { result } = renderHook(() => useDeleteProfissional("profissional-1"), {
      wrapper: criarWrapper(),
    });

    await expect(result.current.mutateAsync()).resolves.toEqual(resposta);
    expect(mocks.deletarProfissional).toHaveBeenCalledExactlyOnceWith("profissional-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("remove o detalhe e aguarda a invalidação da listagem depois do sucesso", async () => {
    mocks.deletarProfissional.mockResolvedValueOnce({ success: true });
    const removeQueries = vi.spyOn(queryClient, "removeQueries");
    let concluirInvalidacao: (() => void) | undefined;
    const invalidacaoPendente = new Promise<void>((resolve) => {
      concluirInvalidacao = resolve;
    });
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockReturnValueOnce(invalidacaoPendente);

    const { result } = renderHook(() => useDeleteProfissional("profissional-1"), {
      wrapper: criarWrapper(),
    });

    let mutacaoConcluida = false;
    const mutacao = result.current.mutateAsync().then(() => {
      mutacaoConcluida = true;
    });

    await waitFor(() => {
      expect(removeQueries).toHaveBeenCalledWith({
        queryKey: ["profissional", "profissional-1"],
        exact: true,
      });
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["profissionais"] });
    });

    expect(mutacaoConcluida).toBe(false);

    concluirInvalidacao?.();
    await mutacao;

    expect(mutacaoConcluida).toBe(true);
  });

  it("propaga o erro genérico lançado pelo serviço sem invalidar o cache", async () => {
    const erro = new Error("Falha de conexão");
    mocks.deletarProfissional.mockRejectedValueOnce(erro);
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const removeQueries = vi.spyOn(queryClient, "removeQueries");

    const { result } = renderHook(() => useDeleteProfissional("profissional-1"), {
      wrapper: criarWrapper(),
    });

    await expect(result.current.mutateAsync()).rejects.toBe(erro);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateQueries).not.toHaveBeenCalled();
    expect(removeQueries).not.toHaveBeenCalled();
  });

  it("transforma o resultado de falha em erro sem invalidar o cache", async () => {
    mocks.deletarProfissional.mockResolvedValueOnce({
      success: false,
      status: 400,
      title: "Não é possível excluir o profissional",
      message: "O profissional possui vínculos.",
    });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const removeQueries = vi.spyOn(queryClient, "removeQueries");

    const { result } = renderHook(() => useDeleteProfissional("profissional-1"), {
      wrapper: criarWrapper(),
    });

    await expect(result.current.mutateAsync()).rejects.toThrow(
      "O profissional possui vínculos.",
    );
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateQueries).not.toHaveBeenCalled();
    expect(removeQueries).not.toHaveBeenCalled();
  });
});
