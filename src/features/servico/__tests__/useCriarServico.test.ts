import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCriarServico } from "../hooks/useCriarServico";
import { criarServicoAction } from "../services/servico.api";

const { replaceMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("../services/servico.api", () => ({
  criarServicoAction: vi.fn(),
}));

function criarWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return createElement(
      QueryClientProvider,
      {
        client: queryClient,
      },
      children,
    );
  }

  return {
    Wrapper,
    queryClient,
  };
}

describe("useCriarServico", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve chamar criarServicoAction com os dados informados", async () => {
    vi.mocked(criarServicoAction).mockResolvedValue({
      success: true,
      service: {
        service_name: "Jardinagem",
        status: "ativo",
      },
    });

    const { Wrapper } = criarWrapper();

    const { result } = renderHook(() => useCriarServico(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        service_name: "Jardinagem",
        status: "ativo",
      });
    });

    expect(criarServicoAction).toHaveBeenCalledTimes(1);

    const [dadosRecebidos] = vi.mocked(criarServicoAction).mock.calls[0];

    expect(dadosRecebidos).toEqual({
      service_name: "Jardinagem",
      status: "ativo",
    });
  });

  it("deve redirecionar para a listagem quando o cadastro for realizado com sucesso", async () => {
    vi.mocked(criarServicoAction).mockResolvedValue({
      success: true,
      service: {
        service_name: "Pintura",
        status: "ativo",
      },
    });

    const { Wrapper } = criarWrapper();

    const { result } = renderHook(() => useCriarServico(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        service_name: "Pintura",
        status: "ativo",
      });
    });

    expect(replaceMock).toHaveBeenCalledTimes(1);

    expect(replaceMock).toHaveBeenCalledWith("/dashboard/cadastro/servicos");
  });

  it("não deve redirecionar quando a action retornar erro", async () => {
    vi.mocked(criarServicoAction).mockResolvedValue({
      success: false,
      error: "server-error",
    });

    const { Wrapper } = criarWrapper();

    const { result } = renderHook(() => useCriarServico(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        service_name: "Pintura",
        status: "inativo",
      });
    });

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve registrar o erro no console quando a mutation falhar", async () => {
    const erro = new Error("Falha inesperada");

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(criarServicoAction).mockRejectedValue(erro);

    const { Wrapper } = criarWrapper();

    const { result } = renderHook(() => useCriarServico(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          service_name: "Elétrica",
          status: "ativo",
        }),
      ).rejects.toThrow("Falha inesperada");
    });

    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith(
        "Erro ao criar serviço:",
        erro,
      );
    });

    consoleErrorMock.mockRestore();
  });
});
