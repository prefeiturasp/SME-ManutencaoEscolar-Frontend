import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeleteEmpresa } from "@/features/empresa/hooks/useDeleteEmpresa";
import { deletarEmpresa } from "@/features/empresa/services/empresa.service";

vi.mock("@/features/empresa/services/empresa.service", () => ({
  deletarEmpresa: vi.fn(),
}));

const mockDeletarEmpresa = vi.mocked(deletarEmpresa);

describe("useDeleteEmpresa", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
  });

  function criarWrapper() {
    return function TestWrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    };
  }

  it("deve ter isPending false inicialmente", () => {
    const { result } = renderHook(() => useDeleteEmpresa("uuid-1"), {
      wrapper: criarWrapper(),
    });

    expect(result.current.isPending).toBe(false);
  });

  it("deve chamar deletarEmpresa com o uuid ao mutar", async () => {
    mockDeletarEmpresa.mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useDeleteEmpresa("uuid-1"), {
      wrapper: criarWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(mockDeletarEmpresa).toHaveBeenCalledWith("uuid-1");
    });
  });

  it("deve ter isSuccess true após sucesso", async () => {
    mockDeletarEmpresa.mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useDeleteEmpresa("uuid-1"), {
      wrapper: criarWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("deve invalidar as queries de listagem e de detalhe ao sucesso", async () => {
    mockDeletarEmpresa.mockResolvedValue({
      success: true,
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteEmpresa("uuid-1"), {
      wrapper: criarWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["empresas"],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["empresa", "uuid-1"],
      });
    });
  });

  it("deve rejeitar a mutation com a mensagem da API quando o resultado indicar falha", async () => {
    mockDeletarEmpresa.mockResolvedValue({
      success: false,
      title: "Erro",
      message: "Empresa possui vínculos ativos.",
      status: 400,
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteEmpresa("uuid-1"), {
      wrapper: criarWrapper(),
    });

    const mutation = result.current.mutateAsync();

    await expect(mutation).rejects.toThrow("Empresa possui vínculos ativos.");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });
});
