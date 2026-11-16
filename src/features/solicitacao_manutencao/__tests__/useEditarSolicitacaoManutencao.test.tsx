import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useEditarSolicitacaoManutencao } from "../hooks/useEditarSolicitacaoManutencao";
import {
  editarSolicitacaoManutencaoAction,
  editarEEnviarSolicitacaoManutencaoAction,
} from "../services/editarSolicitacaoManutencao.api";

vi.mock("../services/editarSolicitacaoManutencao.api", () => ({
  editarSolicitacaoManutencaoAction: vi.fn(),
  editarEEnviarSolicitacaoManutencaoAction: vi.fn(),
}));
const parametros = {
  uuid: "s1",
  unidade_educacional: "ue1",
  tipo_atendimento: "comum",
  servicos: [],
};

describe("useEditarSolicitacaoManutencao", () => {
  function preparar() {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidar = vi.spyOn(client, "invalidateQueries");
    const hook = renderHook(() => useEditarSolicitacaoManutencao(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    return { ...hook, client, invalidar };
  }
  it.each([false, true])(
    "limpa o específico antes de enviar UUID do catálogo, enviar=%s",
    async (enviar) => {
      const acao = enviar
        ? editarEEnviarSolicitacaoManutencaoAction
        : editarSolicitacaoManutencaoAction;
      vi.mocked(acao).mockResolvedValueOnce({ success: true, codigo: "12" });
      const { result, client } = preparar();
      const item = {
        uuid: "item1",
        servico: "uuid-catalogo",
        servico_especifico: "Nome anterior",
        local_reparo: "Sala",
        descricao: "Reparo",
        arquivos: [{ uuid: "anexo1" }],
      };
      try {
        await act(async () => {
          await result.current.mutateAsync({ ...parametros, enviar, servicos: [item] });
        });
        expect(vi.mocked(acao).mock.lastCall![0].servicos).toEqual([
          { ...item, servico_especifico: "" },
        ]);
        expect(item.servico_especifico).toBe("Nome anterior");
      } finally {
        client.clear();
      }
    },
  );
  it.each([false, true])(
    "envia servico vazio com específico no corpo da ação, enviar=%s",
    async (enviar) => {
      const acao = enviar
        ? editarEEnviarSolicitacaoManutencaoAction
        : editarSolicitacaoManutencaoAction;
      vi.mocked(acao).mockResolvedValueOnce({ success: true, codigo: "12" });
      const { result, client } = preparar();
      const item = {
        uuid: "item1",
        servico: "outros",
        servico_especifico: "Limpeza",
        local_reparo: "Sala",
        descricao: "Limpar",
        arquivos: [{ uuid: "anexo1" }],
      };
      try {
        await act(async () => {
          await result.current.mutateAsync({ ...parametros, enviar, servicos: [item] });
        });
        expect(vi.mocked(acao).mock.lastCall![0].servicos).toEqual([{ ...item, servico: "" }]);
      } finally {
        client.clear();
      }
    },
  );
  it.each([true, false])(
    "invalida lista e detalhes somente quando há sucesso: %s",
    async (sucesso) => {
      vi.mocked(editarSolicitacaoManutencaoAction).mockResolvedValueOnce(
        sucesso
          ? { success: true, codigo: "12" }
          : { success: false, error: "api-error", title: "Erro", message: "Inválido" },
      );
      const { result, client, invalidar } = preparar();
      try {
        await act(async () => {
          await result.current.mutateAsync(parametros);
        });
        expect(editarSolicitacaoManutencaoAction).toHaveBeenCalledWith(parametros);
        if (sucesso)
          expect(invalidar).toHaveBeenCalledWith({
            queryKey: ["solicitacoes-manutencao"],
            refetchType: "none",
          });
        else expect(invalidar).not.toHaveBeenCalled();
        expect(client.getMutationCache().getAll()[0].options.meta).toEqual({
          loading: {
            titulo: "Aguarde um momento!",
            mensagem: "Estamos atualizando a solicitação...",
          },
        });
      } finally {
        client.clear();
      }
    },
  );
  it("envia para DRE sem serializar enviar nos dados da ação", async () => {
    vi.mocked(editarEEnviarSolicitacaoManutencaoAction).mockResolvedValueOnce({
      success: true,
      codigo: "12",
    });
    const { result, client } = preparar();
    try {
      await act(async () => {
        await result.current.mutateAsync({ ...parametros, enviar: true });
      });
      expect(editarEEnviarSolicitacaoManutencaoAction).toHaveBeenCalledWith(parametros);
    } finally {
      client.clear();
    }
  });
  it("propaga erro inesperado e registra a falha", async () => {
    const erro = new Error("Sem conexão");
    vi.mocked(editarSolicitacaoManutencaoAction).mockRejectedValueOnce(erro);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result, client, invalidar } = preparar();
    try {
      await act(async () => {
        await expect(result.current.mutateAsync(parametros)).rejects.toThrow("Sem conexão");
      });
      expect(invalidar).not.toHaveBeenCalled();
      expect(log).toHaveBeenCalledWith("Erro ao editar solicitação:", erro);
    } finally {
      log.mockRestore();
      client.clear();
    }
  });
});
