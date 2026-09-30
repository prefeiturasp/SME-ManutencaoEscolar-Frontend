import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useExcluirCargo } from "../hooks/useDeleteCargo";

const {
  excluirCargoMock,
  invalidateQueriesMock,
  useMutationMock,
  useQueryClientMock,
  retornoMutationMock,
} = vi.hoisted(() => ({
  excluirCargoMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  retornoMutationMock: {
    mutate: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("../services/excluirCargo.api", () => ({
  excluirCargo: excluirCargoMock,
}));

type ConfiguracaoMutation = {
  mutationFn: () => Promise<unknown>;

  meta: {
    loading: {
      titulo: string;
      mensagem: string;
    };
  };

  onSuccess: () => Promise<void>;
};

function obterConfiguracaoMutation(): ConfiguracaoMutation {
  return useMutationMock.mock.calls.at(-1)?.[0] as ConfiguracaoMutation;
}

describe("useExcluirCargo", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    invalidateQueriesMock.mockResolvedValue(undefined);

    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });

    useMutationMock.mockReturnValue(retornoMutationMock);
  });

  it("configura a mutation e retorna seu resultado", () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    const { result } = renderHook(() => useExcluirCargo(uuid));

    expect(useQueryClientMock).toHaveBeenCalledTimes(1);

    expect(useMutationMock).toHaveBeenCalledTimes(1);

    expect(result.current).toBe(retornoMutationMock);
  });

  it("configura as informações de carregamento", () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    renderHook(() => useExcluirCargo(uuid));

    const configuracao = obterConfiguracaoMutation();

    expect(configuracao.meta).toEqual({
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos excluindo o cargo...",
      },
    });
  });

  it("exclui o cargo com o UUID informado", async () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    const resultadoExclusao = {
      success: true,
    };

    excluirCargoMock.mockResolvedValue(resultadoExclusao);

    renderHook(() => useExcluirCargo(uuid));

    const configuracao = obterConfiguracaoMutation();

    const resultado = await configuracao.mutationFn();

    expect(excluirCargoMock).toHaveBeenCalledTimes(1);

    expect(excluirCargoMock).toHaveBeenCalledWith(uuid);

    expect(resultado).toEqual(resultadoExclusao);
  });

  it("lança erro quando a exclusão não é bem-sucedida", async () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    excluirCargoMock.mockResolvedValue({
      success: false,
      message: "Não foi possível excluir o cargo.",
    });

    renderHook(() => useExcluirCargo(uuid));

    const configuracao = obterConfiguracaoMutation();

    await expect(configuracao.mutationFn()).rejects.toThrow("Não foi possível excluir o cargo.");

    expect(excluirCargoMock).toHaveBeenCalledWith(uuid);
  });

  it("invalida a listagem e os detalhes após a exclusão", async () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    renderHook(() => useExcluirCargo(uuid));

    const configuracao = obterConfiguracaoMutation();

    await configuracao.onSuccess();

    expect(invalidateQueriesMock).toHaveBeenCalledTimes(2);

    expect(invalidateQueriesMock).toHaveBeenNthCalledWith(1, {
      queryKey: ["cargos"],
    });

    expect(invalidateQueriesMock).toHaveBeenNthCalledWith(2, {
      queryKey: ["cargos", uuid],
    });
  });

  it("aguarda a invalidação da listagem antes dos detalhes", async () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    const ordem: string[] = [];

    invalidateQueriesMock
      .mockImplementationOnce(async () => {
        ordem.push("listagem");
      })
      .mockImplementationOnce(async () => {
        ordem.push("detalhes");
      });

    renderHook(() => useExcluirCargo(uuid));

    const configuracao = obterConfiguracaoMutation();

    await configuracao.onSuccess();

    expect(ordem).toEqual(["listagem", "detalhes"]);
  });
});
