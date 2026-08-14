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

  function Wrapper({
    children,
  }: Readonly<{
    children: ReactNode;
  }>) {
    return createElement(
      QueryClientProvider,
      {
        client: queryClient,
      },
      children,
    );
  }

  return Wrapper;
}

describe("useCriarServico", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve chamar criarServicoAction com os dados informados", async () => {
    vi.mocked(criarServicoAction).mockResolvedValue({
      success: true,
      service: {
        id: 1,
        uuid: "2e7d7d7d-9b8b-4c92-9b3b-123456789abc",
        nome: "Jardinagem",
        status: true,
      },
    });

    const { result } = renderHook(() => useCriarServico(), {
      wrapper: criarWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        nome: "Jardinagem",
        status: true,
      });
    });

    expect(criarServicoAction).toHaveBeenCalledTimes(1);

    const primeiraChamada = vi.mocked(criarServicoAction).mock.calls[0];

    expect(primeiraChamada?.[0]).toEqual({
      nome: "Jardinagem",
      status: true,
    });
  });

  it("deve redirecionar quando o serviço for criado com sucesso", async () => {
    vi.mocked(criarServicoAction).mockResolvedValue({
      success: true,
      service: {
        id: 2,
        uuid: "7b48792f-e28c-4471-a91a-123456789abc",
        nome: "Pintura",
        status: true,
      },
    });

    const { result } = renderHook(() => useCriarServico(), {
      wrapper: criarWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        nome: "Pintura",
        status: true,
      });
    });

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledTimes(1);
    });

    expect(replaceMock).toHaveBeenCalledWith("/cadastro/servicos");
  });

  it("não deve redirecionar quando a action retornar erro", async () => {
    vi.mocked(criarServicoAction).mockResolvedValue({
      success: false,
      error: "api-error",
      title: "Não foi possível cadastrar o serviço",
      message: "Já existe um serviço com esse nome.",
      status: 400,
    });

    const { result } = renderHook(() => useCriarServico(), {
      wrapper: criarWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        nome: "Pintura",
        status: false,
      });
    });

    expect(criarServicoAction).toHaveBeenCalledTimes(1);

    const primeiraChamada = vi.mocked(criarServicoAction).mock.calls[0];

    expect(primeiraChamada?.[0]).toEqual({
      nome: "Pintura",
      status: false,
    });

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve registrar o erro quando a mutation falhar", async () => {
    const erro = new Error("Falha inesperada");

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    vi.mocked(criarServicoAction).mockRejectedValue(erro);

    const { result } = renderHook(() => useCriarServico(), {
      wrapper: criarWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          nome: "Elétrica",
          status: true,
        }),
      ).rejects.toThrow("Falha inesperada");
    });

    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith(
        "Erro ao criar serviço:",
        erro,
      );
    });

    expect(replaceMock).not.toHaveBeenCalled();

    consoleErrorMock.mockRestore();
  });
});
