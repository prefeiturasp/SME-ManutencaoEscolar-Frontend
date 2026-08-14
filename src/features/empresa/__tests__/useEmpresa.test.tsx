import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEmpresa } from "@/features/empresa/hooks/useEmpresa";
import { buscarEmpresaPorUuid } from "@/features/empresa/services/empresa.service";
import type { Empresa } from "@/features/empresa/types/empresa.types";

vi.mock("@/features/empresa/services/empresa.service", () => ({
  buscarEmpresaPorUuid: vi.fn(),
}));

const mockBuscarEmpresaPorUuid = vi.mocked(buscarEmpresaPorUuid);

const EMPRESA: Empresa = {
  id: 1,
  uuid: "uuid-1",
  nome: "Empresa Teste",
  cnpj: "12345678000199",
  status: true,
  razao_social: "Empresa Teste LTDA",
  cep: "01000000",
  logradouro: "Rua Teste",
  numero: "123",
  cidade: "São Paulo",
  estado: "SP",
  criado_por: "Usuário Teste",
  criado_em: "2026-01-01T10:00:00Z",
  atualizado_por: "Usuário Teste",
  atualizado_em: "2026-01-02T10:00:00Z",
};

function criarWrapper(queryClient: QueryClient) {
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useEmpresa", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("deve chamar buscarEmpresaPorUuid com o uuid informado", async () => {
    mockBuscarEmpresaPorUuid.mockResolvedValue(EMPRESA);

    renderHook(() => useEmpresa("uuid-1"), {
      wrapper: criarWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockBuscarEmpresaPorUuid).toHaveBeenCalledWith("uuid-1");
    });
  });

  it("deve retornar os dados da empresa após sucesso", async () => {
    mockBuscarEmpresaPorUuid.mockResolvedValue(EMPRESA);

    const { result } = renderHook(() => useEmpresa("uuid-1"), {
      wrapper: criarWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(EMPRESA);
    });
  });

  it("não deve chamar o serviço quando o uuid estiver vazio", () => {
    renderHook(() => useEmpresa(""), {
      wrapper: criarWrapper(queryClient),
    });

    expect(mockBuscarEmpresaPorUuid).not.toHaveBeenCalled();
  });
});
