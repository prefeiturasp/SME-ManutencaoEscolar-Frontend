import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCriarSolicitacao } from "../hooks/useCriarSolicitacao";
import { criarSolicitacaoAction } from "../services/criarSolicitacao.api";
import type { CriarSolicitacaoParams } from "../types/solicitacao.types";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("../services/criarSolicitacao.api", () => ({ criarSolicitacaoAction: vi.fn() }));

describe("useCriarSolicitacao", () => {
  it("propaga erro inesperado sem redirecionar", async () => {
    const erro = new Error("Sem conexão");
    vi.mocked(criarSolicitacaoAction).mockRejectedValueOnce(erro);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const { result } = renderHook(() => useCriarSolicitacao(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    try {
      await act(async () => {
        await expect(
          result.current.mutateAsync({
            unidade_educacional: "ue",
            tipo_atendimento: "comum",
            servicos: [],
          }),
        ).rejects.toThrow("Sem conexão");
      });
      expect(replace).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Erro ao criar solicitação:", erro);
    } finally {
      consoleSpy.mockRestore();
      client.clear();
    }
  });
  beforeEach(() => vi.clearAllMocks());

  it.each([true, false])(
    "invalida a lista em caso de sucesso e deixa a navegação para a página: %s",
    async (sucesso) => {
      const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
      const invalidar = vi.spyOn(queryClient, "invalidateQueries");
      vi.mocked(criarSolicitacaoAction).mockResolvedValue(
        sucesso
          ? { success: true, codigo: "SOL-001" }
          : { success: false, error: "api-error", title: "Erro", message: "Falha" },
      );
      const parametros: CriarSolicitacaoParams = {
        unidade_educacional: "ue-uuid",
        tipo_atendimento: "comum",
        servicos: [],
        enviar: true,
      };
      const { result } = renderHook(() => useCriarSolicitacao(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await act(async () => {
        await result.current.mutateAsync(parametros);
      });
      expect(criarSolicitacaoAction).toHaveBeenCalledWith(parametros, expect.anything());
      if (sucesso) {
        expect(invalidar).toHaveBeenCalledWith({ queryKey: ["solicitacoes-manutencao"] });
        expect(replace).not.toHaveBeenCalled();
      } else {
        expect(invalidar).not.toHaveBeenCalled();
        expect(replace).not.toHaveBeenCalled();
      }
      queryClient.clear();
    },
  );
});
