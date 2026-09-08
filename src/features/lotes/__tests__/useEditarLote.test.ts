import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useEditarLote } from "@/features/lotes/hooks/useEditarLote";
import type { LoteFormData } from "@/features/lotes/schemas/loteSchema";
import { editarLoteAction } from "@/features/lotes/services/editarLote";

type ResultadoMutation =
  | {
      success: true;
      lote: unknown;
    }
  | {
      success: false;
      error: string;
      title: string;
      message: string;
      status?: number;
      vinculados: unknown[];
    };

type MutationOptions = {
  mutationFn: (dados: LoteFormData) => Promise<ResultadoMutation>;
  meta: {
    loading: {
      titulo: string;
      mensagem: string;
    };
  };
  onSuccess: (resultado: ResultadoMutation) => Promise<void>;
};

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
  invalidateQueries: vi.fn(),
  editarLoteAction: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.useMutation,
  useQueryClient: mocks.useQueryClient,
}));

vi.mock("@/features/lotes/services/editarLote", () => ({
  editarLoteAction: mocks.editarLoteAction,
}));

const dadosFormulario: LoteFormData = {
  codigo_cadastro: "LOTE-001",
  nome: "Lote Teste",
  empresa: "empresa-uuid-1",
  periodo_inicial: "2026-01-01",
  periodo_final: "2026-12-31",
  status: "true",
  diretorias_regionais: ["1", "2"],
};

const retornoUseMutation = {
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
};

function obterOpcoesMutation(): MutationOptions {
  const ultimaChamada =
    mocks.useMutation.mock.calls[mocks.useMutation.mock.calls.length - 1];

  return ultimaChamada[0] as MutationOptions;
}

describe("useEditarLote", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useQueryClient.mockReturnValue({
      invalidateQueries: mocks.invalidateQueries,
    });

    mocks.useMutation.mockReturnValue(retornoUseMutation);

    mocks.invalidateQueries.mockResolvedValue(undefined);
  });

  it("configura e retorna a mutation", () => {
    const { result } = renderHook(() => useEditarLote("lote-uuid-1"));

    expect(mocks.useQueryClient).toHaveBeenCalledOnce();
    expect(mocks.useMutation).toHaveBeenCalledOnce();
    expect(result.current).toBe(retornoUseMutation);

    expect(obterOpcoesMutation().meta).toEqual({
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos salvando as informações...",
      },
    });
  });

  it("executa a action com o uuid e os dados do formulário", async () => {
    const resultadoAction: ResultadoMutation = {
      success: true,
      lote: {
        uuid: "lote-uuid-1",
      },
    };

    mocks.editarLoteAction.mockResolvedValue(resultadoAction);

    renderHook(() => useEditarLote("lote-uuid-1"));

    const { mutationFn } = obterOpcoesMutation();

    const resultado = await mutationFn(dadosFormulario);

    expect(editarLoteAction).toHaveBeenCalledWith({
      uuid: "lote-uuid-1",
      dados: dadosFormulario,
    });

    expect(resultado).toEqual(resultadoAction);
  });

  it("não invalida as queries quando a edição retorna erro", async () => {
    const resultadoErro: ResultadoMutation = {
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Não foi possível editar o lote.",
      status: 400,
      vinculados: [],
    };

    renderHook(() => useEditarLote("lote-uuid-1"));

    const { onSuccess } = obterOpcoesMutation();

    await onSuccess(resultadoErro);

    expect(mocks.invalidateQueries).not.toHaveBeenCalled();
  });

  it("invalida a listagem e os detalhes quando a edição tem sucesso", async () => {
    const resultadoSucesso: ResultadoMutation = {
      success: true,
      lote: {
        uuid: "lote-uuid-1",
      },
    };

    renderHook(() => useEditarLote("lote-uuid-1"));

    const { onSuccess } = obterOpcoesMutation();

    await onSuccess(resultadoSucesso);

    expect(mocks.invalidateQueries).toHaveBeenCalledTimes(2);

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: ["lotes"],
    });

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: ["lote", "lote-uuid-1"],
    });
  });

  it("aguarda a invalidação das duas queries", async () => {
    let liberarPrimeiraInvalidacao: (() => void) | undefined;
    let liberarSegundaInvalidacao: (() => void) | undefined;

    const primeiraInvalidacao = new Promise<void>((resolve) => {
      liberarPrimeiraInvalidacao = resolve;
    });

    const segundaInvalidacao = new Promise<void>((resolve) => {
      liberarSegundaInvalidacao = resolve;
    });

    mocks.invalidateQueries
      .mockReturnValueOnce(primeiraInvalidacao)
      .mockReturnValueOnce(segundaInvalidacao);

    renderHook(() => useEditarLote("lote-uuid-1"));

    const { onSuccess } = obterOpcoesMutation();

    const execucao = onSuccess({
      success: true,
      lote: {
        uuid: "lote-uuid-1",
      },
    });

    expect(mocks.invalidateQueries).toHaveBeenCalledTimes(1);

    liberarPrimeiraInvalidacao?.();

    await primeiraInvalidacao;

    expect(mocks.invalidateQueries).toHaveBeenCalledTimes(2);

    liberarSegundaInvalidacao?.();

    await expect(execucao).resolves.toBeUndefined();
  });
});
