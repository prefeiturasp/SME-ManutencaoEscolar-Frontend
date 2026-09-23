import { renderHook } from "@testing-library/react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CargoFormData } from "../schemas/cargoSchema";

import { editarCargoAction } from "../services/editarCargo.api";

import { useEditarCargo } from "../hooks/useEditarCargo";

type ResultadoEditarCargo =
  | {
      success: true;
      cargo?: {
        uuid: string;
        nome: string;
      };
    }
  | {
      success: false;
      status?: number;
      title?: string;
      message?: string;
    };

type ConfiguracaoMutation = {
  mutationFn: (dados: CargoFormData) => Promise<ResultadoEditarCargo>;

  meta: {
    loading: {
      titulo: string;
      mensagem: string;
    };
  };

  onSuccess: (resultado: ResultadoEditarCargo) => Promise<void>;
};

const mocks = vi.hoisted(() => {
  const invalidateQueries = vi.fn();

  return {
    invalidateQueries,

    useQueryClient: vi.fn(() => ({
      invalidateQueries,
    })),

    useMutation: vi.fn((configuracao: unknown) => configuracao),

    editarCargoAction: vi.fn(),
  };
});

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: mocks.useQueryClient,
  useMutation: mocks.useMutation,
}));

vi.mock("../services/editarCargo.api", () => ({
  editarCargoAction: mocks.editarCargoAction,
}));

function obterConfiguracao(): ConfiguracaoMutation {
  const chamada = mocks.useMutation.mock.calls[0];

  if (!chamada) {
    throw new Error("useMutation não foi chamado.");
  }

  return chamada[0] as ConfiguracaoMutation;
}

describe("useEditarCargo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configura a mutation de edição do cargo", () => {
    const uuid = "a6421bd7-a6e5-4883-a7c7-43cff161618a";

    renderHook(() => useEditarCargo(uuid));

    expect(mocks.useQueryClient).toHaveBeenCalledOnce();
    expect(mocks.useMutation).toHaveBeenCalledOnce();

    const configuracao = obterConfiguracao();

    expect(configuracao.mutationFn).toEqual(expect.any(Function));

    expect(configuracao.onSuccess).toEqual(expect.any(Function));

    expect(configuracao.meta).toEqual({
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos salvando as informações...",
      },
    });
  });

  it("executa a action com o UUID e os dados recebidos", async () => {
    const uuid = "a6421bd7-a6e5-4883-a7c7-43cff161618a";

    const dados: CargoFormData = {
      nome: "Engenheiro Eletricista",
      exige_documento: "true",
      novo_documento: "",
      documentos: [
        {
          nome: "Certificado NR-10",
        },
      ],
    };

    const resultado: ResultadoEditarCargo = {
      success: true,
      cargo: {
        uuid,
        nome: "Engenheiro Eletricista",
      },
    };

    mocks.editarCargoAction.mockResolvedValueOnce(resultado);

    renderHook(() => useEditarCargo(uuid));

    const configuracao = obterConfiguracao();

    await expect(configuracao.mutationFn(dados)).resolves.toEqual(resultado);

    expect(editarCargoAction).toHaveBeenCalledExactlyOnceWith({
      uuid,
      dados,
    });
  });

  it("retorna o resultado de erro recebido da action", async () => {
    const uuid = "a6421bd7-a6e5-4883-a7c7-43cff161618a";

    const dados: CargoFormData = {
      nome: "Engenheiro Eletricista",
      exige_documento: "false",
      novo_documento: "",
      documentos: [],
    };

    const resultado: ResultadoEditarCargo = {
      success: false,
      status: 400,
      title: "Cargo já cadastrado",
      message: "Já existe outro cargo com o nome informado.",
    };

    mocks.editarCargoAction.mockResolvedValueOnce(resultado);

    renderHook(() => useEditarCargo(uuid));

    const configuracao = obterConfiguracao();

    await expect(configuracao.mutationFn(dados)).resolves.toEqual(resultado);

    expect(editarCargoAction).toHaveBeenCalledExactlyOnceWith({
      uuid,
      dados,
    });
  });

  it("invalida a lista e o cargo editado quando a edição tem sucesso", async () => {
    const uuid = "a6421bd7-a6e5-4883-a7c7-43cff161618a";

    mocks.invalidateQueries.mockResolvedValue(undefined);

    renderHook(() => useEditarCargo(uuid));

    const configuracao = obterConfiguracao();

    await configuracao.onSuccess({
      success: true,
      cargo: {
        uuid,
        nome: "Engenheiro Eletricista",
      },
    });

    expect(mocks.invalidateQueries).toHaveBeenCalledTimes(2);

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: ["cargos"],
    });

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: ["cargo", uuid],
    });
  });

  it("aguarda a invalidação da lista antes de invalidar o cargo", async () => {
    const uuid = "a6421bd7-a6e5-4883-a7c7-43cff161618a";

    let liberarInvalidacaoLista: (() => void) | undefined;

    mocks.invalidateQueries
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            liberarInvalidacaoLista = resolve;
          }),
      )
      .mockResolvedValueOnce(undefined);

    renderHook(() => useEditarCargo(uuid));

    const configuracao = obterConfiguracao();

    const promessa = configuracao.onSuccess({
      success: true,
    });

    expect(mocks.invalidateQueries).toHaveBeenCalledTimes(1);

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: ["cargos"],
    });

    liberarInvalidacaoLista?.();

    await promessa;

    expect(mocks.invalidateQueries).toHaveBeenCalledTimes(2);

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: ["cargo", uuid],
    });
  });

  it("não invalida as queries quando a edição falha", async () => {
    const uuid = "a6421bd7-a6e5-4883-a7c7-43cff161618a";

    renderHook(() => useEditarCargo(uuid));

    const configuracao = obterConfiguracao();

    await configuracao.onSuccess({
      success: false,
      status: 400,
      title: "Dados inválidos",
      message: "Não foi possível atualizar o cargo.",
    });

    expect(mocks.invalidateQueries).not.toHaveBeenCalled();
  });

  it("utiliza o UUID correspondente na query do cargo", async () => {
    const uuid = "outro-uuid-cargo";

    mocks.invalidateQueries.mockResolvedValue(undefined);

    renderHook(() => useEditarCargo(uuid));

    const configuracao = obterConfiguracao();

    await configuracao.onSuccess({
      success: true,
    });

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: ["cargo", "outro-uuid-cargo"],
    });
  });
});
