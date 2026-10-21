import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useOpcoesServicos } from "../hooks/useOpcoesServicos";
import { listarServicosAction } from "../services/buscar.api";
import type { RespostaServicos } from "../types/servicos.types";
vi.mock("../services/buscar.api", () => ({ listarServicosAction: vi.fn() }));

describe("useOpcoesServicos", () => {
  it("percorre páginas e ignora serviços inativos ou incompletos", async () => {
    vi.mocked(listarServicosAction)
      .mockReset()
      .mockResolvedValueOnce({
        next: "pagina2",
        results: [
          { uuid: "a", nome: "Pintura", status: true },
          { uuid: "", nome: "Sem UUID", status: true },
          { uuid: "b", nome: "", status: true },
          { uuid: "c", nome: "Inativo", status: false },
        ],
      } as RespostaServicos)
      .mockResolvedValueOnce({
        next: null,
        results: [{ uuid: "d", nome: "Alvenaria", status: true }],
      } as RespostaServicos);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result, unmount } = renderHook(() => useOpcoesServicos(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      { value: "a", label: "Pintura" },
      { value: "d", label: "Alvenaria" },
    ]);
    expect(listarServicosAction).toHaveBeenNthCalledWith(1, {
      status: true,
      page: 1,
      page_size: 100,
    });
    expect(listarServicosAction).toHaveBeenNthCalledWith(2, {
      status: true,
      page: 2,
      page_size: 100,
    });
    unmount();
    client.clear();
  });
  it("expõe falhas da consulta para permitir nova tentativa", async () => {
    vi.mocked(listarServicosAction).mockReset().mockRejectedValue(new Error("Falha"));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result, unmount } = renderHook(() => useOpcoesServicos(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Falha");
    unmount();
    client.clear();
  });
});
