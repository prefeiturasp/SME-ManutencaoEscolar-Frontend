import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreateEmpresa } from "@/features/empresa/hooks/useCreateEmpresa";
import { criarEmpresa } from "@/features/empresa/services/empresa.service";

const toastSucessoMock = vi.fn();

vi.mock("@/components/ui/toast-custom", () => ({
  toastSucesso: toastSucessoMock,
}));

vi.mock("@/features/empresa/services/empresa.service", () => ({
  criarEmpresa: vi.fn(),
}));

const mockCriarEmpresa = vi.mocked(criarEmpresa);

const PAYLOAD = {
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
} as const;

const EMPRESA = {
  id: 1,
  uuid: "uuid-1",
  ...PAYLOAD,
  criado_por: "Usuário Teste",
  criado_em: "2026-01-01T10:00:00Z",
  atualizado_por: "Usuário Teste",
  atualizado_em: "2026-01-02T10:00:00Z",
};

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

  it("deve chamar criarEmpresa ao mutar", async () => {
    mockCriarEmpresa.mockResolvedValue({ success: true, empresa: EMPRESA });

    const { result } = renderHook(() => useCreateEmpresa(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    result.current.mutate(PAYLOAD);

    await waitFor(() => {
      expect(mockCriarEmpresa).toHaveBeenCalledWith(PAYLOAD);
    });
  });

  it("deve ter isSuccess true após sucesso", async () => {
    mockCriarEmpresa.mockResolvedValue({ success: true, empresa: EMPRESA });

    const { result } = renderHook(() => useCreateEmpresa(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    result.current.mutate(PAYLOAD);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("deve invalidar cache ao sucesso", async () => {
    mockCriarEmpresa.mockResolvedValue({ success: true, empresa: EMPRESA });
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateEmpresa(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    result.current.mutate(PAYLOAD);

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["empresas"],
      });
    });
  });

  it("não deve invalidar cache quando o resultado indicar falha", async () => {
    mockCriarEmpresa.mockResolvedValue({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "CNPJ já cadastrado.",
      status: 400,
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateEmpresa(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    result.current.mutate(PAYLOAD);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });
});
