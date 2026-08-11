import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreateEmpresa } from "@/features/empresa/hooks/useCreateEmpresa";
import { empresaService } from "@/features/empresa/services/empresa.service";

const toastSucessoMock = vi.fn();

vi.mock("@/components/ui/toast-custom", () => ({
  toastSucesso: toastSucessoMock,
}));

vi.mock("@/features/empresa/services/empresa.service", () => ({
  empresaService: {
    create: vi.fn(),
  },
}));

const mockService = empresaService as any;

describe("useCreateEmpresa", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
  });

  it("deve ter isPending false inicialmente", () => {
    const { result } = renderHook(() => useCreateEmpresa(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    expect(result.current.isPending).toBe(false);
  });

  it("deve ter isSuccess false inicialmente", () => {
    const { result } = renderHook(() => useCreateEmpresa(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    expect(result.current.isSuccess).toBe(false);
  });

  it("deve ter isError false inicialmente", () => {
    const { result } = renderHook(() => useCreateEmpresa(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    expect(result.current.isError).toBe(false);
  });

  it("deve chamar empresaService.create ao mutar", async () => {
    mockService.create.mockResolvedValue({ id: "1" });

    const { result } = renderHook(() => useCreateEmpresa(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    const payload = {
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
      estado: "SP",
    };

    result.current.mutate(payload);

    await waitFor(() => {
      expect(mockService.create).toHaveBeenCalledWith(payload);
    });
  });

  it("deve ter isSuccess true após sucesso", async () => {
    mockService.create.mockResolvedValue({ id: "1" });

    const { result } = renderHook(() => useCreateEmpresa(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    const payload = {
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
      estado: "SP",
    };

    result.current.mutate(payload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("deve invalidar cache ao sucesso", async () => {
    mockService.create.mockResolvedValue({ id: "1" });
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateEmpresa(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    const payload = {
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
      estado: "SP",
    };

    result.current.mutate(payload);

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalled();
    });
  });
});
