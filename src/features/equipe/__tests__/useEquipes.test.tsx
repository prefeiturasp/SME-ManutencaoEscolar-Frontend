import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEquipes } from "../hooks/useEquipes";
import { listarEquipesAction } from "../services/listarEquipes.api";
import type { EquipeListParams, RespostaEquipes } from "../types/equipe.types";

vi.mock("../services/listarEquipes.api", () => ({ listarEquipesAction: vi.fn() }));
const resposta: RespostaEquipes = { count: 0, next: null, previous: null, results: [] };
let client: QueryClient;
function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
beforeEach(() => {
  vi.resetAllMocks();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => client.clear());

describe("useEquipes", () => {
  it("consulta com os filtros e armazena o resultado na chave correspondente", async () => {
    const filtros: EquipeListParams = {
      page: 1,
      page_size: 10,
      nome: "Norte",
      empresa: "e1",
      lote: "l1",
      situacao: false,
    };
    vi.mocked(listarEquipesAction).mockResolvedValue(resposta);
    const { result } = renderHook(() => useEquipes(filtros), { wrapper });
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listarEquipesAction).toHaveBeenCalledExactlyOnceWith(filtros);
    expect(result.current.data).toEqual(resposta);
    expect(client.getQueryData(["equipes", filtros])).toEqual(resposta);
  });

  it("mantém o resultado anterior enquanto carrega outra página", async () => {
    let resolver!: (dados: RespostaEquipes) => void;
    vi.mocked(listarEquipesAction)
      .mockResolvedValueOnce(resposta)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolver = resolve;
          }),
      );
    const { result, rerender } = renderHook(({ page }) => useEquipes({ page, page_size: 10 }), {
      wrapper,
      initialProps: { page: 1 },
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    rerender({ page: 2 });
    await waitFor(() =>
      expect(listarEquipesAction).toHaveBeenLastCalledWith({ page: 2, page_size: 10 }),
    );
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data).toEqual(resposta);
    const segundaPagina = { ...resposta, count: 20 };
    resolver(segundaPagina);
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
    expect(result.current.data).toEqual(segundaPagina);
  });

  it("expõe o erro retornado pela consulta", async () => {
    const erro = new Error("Falha ao listar equipes");
    vi.mocked(listarEquipesAction).mockRejectedValue(erro);
    const { result } = renderHook(() => useEquipes({ page: 1 }), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(erro);
    expect(result.current.data).toBeUndefined();
  });
});
