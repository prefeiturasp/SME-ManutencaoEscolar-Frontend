import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useExcluirServico } from "@/features/servico/hooks/useDeleteServico";

const {
  mockExcluirServico,
  mockInvalidateQueries,
  mockUseMutation,
  mockUseQueryClient,
} = vi.hoisted(() => ({
  mockExcluirServico: vi.fn(),
  mockInvalidateQueries: vi.fn(),
  mockUseMutation: vi.fn(),
  mockUseQueryClient: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: mockUseMutation,
  useQueryClient: mockUseQueryClient,
}));

vi.mock("@/features/servico/services/excluirServico.api", () => ({
  excluirServico: mockExcluirServico,
}));

type ResultadoExclusao = {
  success: boolean;
  message: string;
};

type MutationOptions = {
  mutationFn: () => Promise<ResultadoExclusao>;
  meta: {
    loading: {
      titulo: string;
      mensagem: string;
    };
  };
  onSuccess: () => Promise<void>;
};

function obterOpcoesMutation(): MutationOptions {
  return mockUseMutation.mock.calls[0][0] as MutationOptions;
}

describe("useExcluirServico", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    mockUseMutation.mockImplementation((options) => options);
    mockInvalidateQueries.mockResolvedValue(undefined);
  });

  it("configura a mutation e os metadados de carregamento", () => {
    const { result } = renderHook(() => useExcluirServico("servico-123"));

    expect(mockUseQueryClient).toHaveBeenCalledOnce();
    expect(mockUseMutation).toHaveBeenCalledOnce();

    expect(result.current).toEqual(
      expect.objectContaining({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
        meta: {
          loading: {
            titulo: "Aguarde um momento!",
            mensagem: "Estamos excluindo o serviço...",
          },
        },
      }),
    );
  });

  it("exclui o serviço e retorna o resultado quando ocorre sucesso", async () => {
    const resultadoApi = {
      success: true,
      message: "Serviço excluído.",
    };

    mockExcluirServico.mockResolvedValue(resultadoApi);

    renderHook(() => useExcluirServico("servico-123"));

    const options = obterOpcoesMutation();
    const resultado = await options.mutationFn();

    expect(mockExcluirServico).toHaveBeenCalledOnce();
    expect(mockExcluirServico).toHaveBeenCalledWith("servico-123");
    expect(resultado).toEqual(resultadoApi);
  });

  it("lança um erro com a mensagem da API quando a exclusão falha", async () => {
    mockExcluirServico.mockResolvedValue({
      success: false,
      message: "O serviço não pode ser excluído.",
    });

    renderHook(() => useExcluirServico("servico-123"));

    const options = obterOpcoesMutation();

    await expect(options.mutationFn()).rejects.toThrow(
      "O serviço não pode ser excluído.",
    );

    expect(mockExcluirServico).toHaveBeenCalledWith("servico-123");
  });

  it("invalida a listagem e os detalhes do serviço após o sucesso", async () => {
    renderHook(() => useExcluirServico("servico-123"));

    const options = obterOpcoesMutation();

    await options.onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);

    expect(mockInvalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: ["servicos"],
    });

    expect(mockInvalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: ["servicos", "servico-123"],
    });
  });
});
