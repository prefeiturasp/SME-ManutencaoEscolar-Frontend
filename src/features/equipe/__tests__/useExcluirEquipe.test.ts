import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useExcluirEquipe } from "@/features/equipe/hooks/useExcluirEquipe";

const { mockExcluirEquipe, mockInvalidateQueries, mockUseMutation, mockUseQueryClient } =
  vi.hoisted(() => ({
    mockExcluirEquipe: vi.fn(),
    mockInvalidateQueries: vi.fn(),
    mockUseMutation: vi.fn(),
    mockUseQueryClient: vi.fn(),
  }));

vi.mock("@tanstack/react-query", () => ({
  useMutation: mockUseMutation,
  useQueryClient: mockUseQueryClient,
}));

vi.mock("@/features/equipe/services/excluirEquipe.api", () => ({
  excluirEquipe: mockExcluirEquipe,
}));

type MutationOptions = {
  mutationFn: () => Promise<unknown>;
  meta: { loading: { titulo: string; mensagem: string } };
  onSuccess: () => Promise<void>;
};

function obterOpcoesMutation(): MutationOptions {
  return mockUseMutation.mock.calls[0][0] as MutationOptions;
}

describe("useExcluirEquipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQueryClient.mockReturnValue({ invalidateQueries: mockInvalidateQueries });
    mockUseMutation.mockImplementation((options) => options);
    mockInvalidateQueries.mockResolvedValue(undefined);
  });

  it("configura a mutation e os metadados de carregamento", () => {
    const { result } = renderHook(() => useExcluirEquipe("equipe-123"));

    expect(result.current).toEqual(
      expect.objectContaining({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
        meta: {
          loading: {
            titulo: "Aguarde um momento!",
            mensagem: "Estamos excluindo a equipe...",
          },
        },
      }),
    );
  });

  it("exclui a equipe e retorna o resultado em caso de sucesso", async () => {
    mockExcluirEquipe.mockResolvedValue({ success: true });
    renderHook(() => useExcluirEquipe("equipe-123"));

    const resultado = await obterOpcoesMutation().mutationFn();

    expect(mockExcluirEquipe).toHaveBeenCalledExactlyOnceWith("equipe-123");
    expect(resultado).toEqual({ success: true });
  });

  it("repassa o resultado completo quando a equipe possui vínculos (400)", async () => {
    const resultadoErro = {
      success: false,
      status: 400,
      title: "Não é possível excluir a equipe",
      message: "A equipe possui vínculos.",
    };
    mockExcluirEquipe.mockResolvedValue(resultadoErro);
    renderHook(() => useExcluirEquipe("equipe-123"));

    await expect(obterOpcoesMutation().mutationFn()).rejects.toBe(resultadoErro);
  });

  it("lança um erro com a mensagem da API nas demais falhas", async () => {
    mockExcluirEquipe.mockResolvedValue({
      success: false,
      status: 500,
      title: "Erro",
      message: "Não conseguimos excluir a equipe.",
    });
    renderHook(() => useExcluirEquipe("equipe-123"));

    await expect(obterOpcoesMutation().mutationFn()).rejects.toThrow(
      "Não conseguimos excluir a equipe.",
    );
  });

  it("invalida a listagem e o detalhe da equipe após o sucesso", async () => {
    renderHook(() => useExcluirEquipe("equipe-123"));

    await obterOpcoesMutation().onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["equipes"] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["equipe", "equipe-123"] });
  });
});
