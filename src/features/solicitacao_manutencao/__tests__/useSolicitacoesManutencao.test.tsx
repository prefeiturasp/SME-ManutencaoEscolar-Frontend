import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";
import { useSolicitacoesManutencao } from "../hooks/useSolicitacoesManutencao";
import { listarSolicitacoesManutencaoAction } from "../services/listarSolicitacoesManutencao.api";

vi.mock("../services/listarSolicitacoesManutencao.api", () => ({
  listarSolicitacoesManutencaoAction: vi.fn(),
}));
it("consulta novamente ao mudar a página e compartilha a chave invalidada pelo cadastro", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const resposta = { count: 0, next: null, previous: null, results: [] };
  vi.mocked(listarSolicitacoesManutencaoAction).mockResolvedValue(resposta);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result, rerender } = renderHook(
    ({ page }) => useSolicitacoesManutencao({ page, page_size: 10 }),
    { initialProps: { page: 1 }, wrapper },
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(client.getQueryData(["solicitacoes-manutencao", { page: 1, page_size: 10 }])).toEqual(
    resposta,
  );
  rerender({ page: 2 });
  await waitFor(() =>
    expect(listarSolicitacoesManutencaoAction).toHaveBeenLastCalledWith({ page: 2, page_size: 10 }),
  );
  await waitFor(() =>
    expect(client.getQueryData(["solicitacoes-manutencao", { page: 2, page_size: 10 }])).toEqual(
      resposta,
    ),
  );
});
