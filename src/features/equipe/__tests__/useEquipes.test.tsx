import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEquipe, useEquipes } from "../hooks/useEquipes";
import { listarEquipesAction } from "../services/listarEquipes.api";
import type { EquipeListParams, RespostaEquipes } from "../types/equipe.types";

vi.mock("../services/listarEquipes.api", () => ({ listarEquipesAction: vi.fn() }));
vi.mock("../services/buscarEquipe.api", () => ({ buscarEquipeAction: vi.fn() }));
import { buscarEquipeAction } from "../services/buscarEquipe.api";

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

describe("useEquipe", () => {
  it("busca pelo UUID e armazena os dados na chave de detalhe", async () => {
    const equipe = {
      uuid: "e1",
      nome: "Equipe",
      situacao: true,
      empresa: { id: 1, uuid: "empresa", nome: "Empresa", cnpj: "111" },
      lote: { uuid: "lote", nome: "Lote", periodo_inicial: null, periodo_final: null },
      profissionais: [],
    };
    vi.mocked(buscarEquipeAction).mockResolvedValue(equipe);
    const { result } = renderHook(() => useEquipe("e1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(buscarEquipeAction).toHaveBeenCalledExactlyOnceWith("e1");
    expect(client.getQueryData(["equipe", "e1"])).toEqual(equipe);
  });
  it("desabilita a busca sem UUID", () => {
    const { result } = renderHook(() => useEquipe(""), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
    expect(buscarEquipeAction).not.toHaveBeenCalled();
  });
  it("expoe falhas da busca", async () => {
    const erro = new Error("Falha");
    vi.mocked(buscarEquipeAction).mockRejectedValue(erro);
    const { result } = renderHook(() => useEquipe("e1"), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(erro);
  });
});
