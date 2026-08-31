import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useQueryMock, listarDiretoriasRegionaisActionMock } = vi.hoisted(
  () => ({
    useQueryMock: vi.fn(),
    listarDiretoriasRegionaisActionMock: vi.fn(),
  }),
);

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("../service/listarDiretoriasRegionais.api", () => ({
  listarDiretoriasRegionaisAction: listarDiretoriasRegionaisActionMock,
}));

// Proteção adicional para nunca carregar a implementação server-side.
vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: vi.fn(),
}));

import { useListarDiretoriasRegionais } from "../hooks/useDiretoriaRegional";

describe("useListarDiretoriasRegionais", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });
  });

  it("configura corretamente a consulta das DREs", () => {
    renderHook(() => useListarDiretoriasRegionais());

    expect(useQueryMock).toHaveBeenCalledTimes(1);

    expect(useQueryMock).toHaveBeenCalledWith({
      queryKey: ["diretorias-regionais"],
      queryFn: listarDiretoriasRegionaisActionMock,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    });
  });

  it("retorna o resultado fornecido pelo React Query", () => {
    const retornoQuery = {
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      isLoading: false,
      isError: false,
    };

    useQueryMock.mockReturnValue(retornoQuery);

    const { result } = renderHook(() => useListarDiretoriasRegionais());

    expect(result.current).toBe(retornoQuery);
  });
});
