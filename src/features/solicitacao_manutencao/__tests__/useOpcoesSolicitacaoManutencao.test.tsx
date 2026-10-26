import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";
import { useOpcoesSolicitacaoManutencao } from "../hooks/useOpcoesSolicitacaoManutencao";
import { listarOpcoesSolicitacaoManutencaoAction } from "../services/opcoesSolicitacaoManutencao.api";

vi.mock("../services/opcoesSolicitacaoManutencao.api", () => ({
  listarOpcoesSolicitacaoManutencaoAction: vi.fn(),
}));

it("compartilha opções entre consumidores e mantém os catálogos separados", async () => {
  const consulta = vi.mocked(listarOpcoesSolicitacaoManutencaoAction);
  consulta.mockImplementation(async (campo) => [{ value: campo, label: `Opção ${campo}` }]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(
    () => ({
      primeiro: useOpcoesSolicitacaoManutencao("tipos_atendimento"),
      segundo: useOpcoesSolicitacaoManutencao("tipos_atendimento"),
      fases: useOpcoesSolicitacaoManutencao("fases"),
    }),
    { wrapper },
  );
  await waitFor(() => expect(result.current.primeiro.isSuccess).toBe(true));
  await waitFor(() => expect(result.current.fases.isSuccess).toBe(true));
  expect(result.current.segundo.data).toEqual([
    { value: "tipos_atendimento", label: "Opção tipos_atendimento" },
  ]);
  expect(result.current.fases.data).toEqual([{ value: "fases", label: "Opção fases" }]);
  expect(consulta).toHaveBeenCalledTimes(2);
  client.clear();
});
