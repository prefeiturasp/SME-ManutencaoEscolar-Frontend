import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useEditarServico } from "../hooks/useEditarServico";
import type { ServiceFormData } from "../schemas/servicoSchema";

const mocks = vi.hoisted(() => ({
  editarServicoAction: vi.fn(),
}));

vi.mock("../services/editarServico", () => ({
  editarServicoAction: mocks.editarServicoAction,
}));

const uuid = "07f14275-59ee-4e67-812a-d5aaa2cedb62";

const dados: ServiceFormData = {
  nome: "Pintura externa",
  status: "true",
};

function criarQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function criarWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return createElement(
      QueryClientProvider,
      {
        client: queryClient,
      },
      children,
    );
  };
}

describe("useEditarServico", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve editar e invalidar as queries quando houver sucesso", async () => {
    const queryClient = criarQueryClient();

    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);

    mocks.editarServicoAction.mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useEditarServico(uuid), {
      wrapper: criarWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(dados);
    });

    expect(mocks.editarServicoAction).toHaveBeenCalledTimes(1);

    expect(mocks.editarServicoAction).toHaveBeenCalledWith({
      uuid,
      dados,
    });

    expect(invalidateQueries).toHaveBeenCalledTimes(2);

    expect(invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: ["servicos"],
    });

    expect(invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: ["servico", uuid],
    });
  });

  it("não deve invalidar as queries quando a API retornar erro", async () => {
    const queryClient = criarQueryClient();

    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);

    mocks.editarServicoAction.mockResolvedValue({
      success: false,
      title: "Erro",
      message: "Não foi possível editar o serviço.",
    });

    const { result } = renderHook(() => useEditarServico(uuid), {
      wrapper: criarWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(dados);
    });

    expect(mocks.editarServicoAction).toHaveBeenCalledTimes(1);

    expect(mocks.editarServicoAction).toHaveBeenCalledWith({
      uuid,
      dados,
    });

    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it("deve configurar os metadados do loading", async () => {
    const queryClient = criarQueryClient();

    mocks.editarServicoAction.mockResolvedValue({
      success: false,
    });

    const { result } = renderHook(() => useEditarServico(uuid), {
      wrapper: criarWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(dados);
    });

    const mutations = queryClient.getMutationCache().getAll();

    expect(mutations).toHaveLength(1);

    expect(mutations[0].options.meta).toEqual({
      loading: {
        titulo: "Aguarde um momento!",
        mensagem: "Estamos salvando as informações...",
      },
    });
  });
});
