import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useEmpresas } from "@/features/empresa/hooks/useEmpresas";
import { empresaService } from "@/features/empresa/services/empresa.service";

vi.mock("@/features/empresa/services/empresa.service", () => ({
  empresaService: {
    list: vi.fn(),
  },
}));

const mockService = empresaService as unknown as {
  list: ReturnType<typeof vi.fn>;
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return Wrapper;
}

describe("useEmpresas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve chamar empresaService.list com os parâmetros informados", async () => {
    const response = { count: 0, next: null, previous: null, results: [] };
    mockService.list.mockResolvedValue(response);

    const { result } = renderHook(() => useEmpresas({ nome: "Empresa" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockService.list).toHaveBeenCalledWith({
        nome: "Empresa",
      });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(response);
    });
  });

  it("deve expor isLoading true antes da resposta", () => {
    mockService.list.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useEmpresas({}), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
