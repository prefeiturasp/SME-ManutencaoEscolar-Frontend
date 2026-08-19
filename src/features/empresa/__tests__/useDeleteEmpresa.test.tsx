import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeleteEmpresa } from "@/features/empresa/hooks/useDeleteEmpresa";
import { deletarEmpresa } from "@/features/empresa/services/empresa.service";

vi.mock("@/features/empresa/services/empresa.service", () => ({
  deletarEmpresa: vi.fn(),
}));

const mockDeletarEmpresa = vi.mocked(deletarEmpresa);

const EMPRESA_EXCLUIDA = {
  id: 1,
  uuid: "uuid-1",
  nome: "Empresa",
  cnpj: "11444777000161",
  status: true,
  razao_social: "Empresa LTDA",
  link_rastreio: "https://example.com",
  cep: "01310100",
  logradouro: "Rua",
  numero: "123",
  complemento: "",
  cidade: "São Paulo",
  estado: "SP" as const,
  criado_por: "Usuário Teste",
  criado_em: "2026-01-01T10:00:00Z",
  atualizado_por: "Usuário Teste",
  atualizado_em: "2026-01-02T10:00:00Z",
};

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
      empresa: EMPRESA_EXCLUIDA,
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
      empresa: EMPRESA_EXCLUIDA,
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
      empresa: EMPRESA_EXCLUIDA,
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

  it("não deve invalidar as queries quando o resultado indicar falha", async () => {
    mockDeletarEmpresa.mockResolvedValue({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Empresa possui vínculos ativos.",
      status: 400,
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteEmpresa("uuid-1"), {
      wrapper: criarWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });
});
