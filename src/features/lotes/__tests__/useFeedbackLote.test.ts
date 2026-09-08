import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useFeedbackLote } from "../hooks/useFeedbackLote";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  toastErro: vi.fn(),
  toastSucesso: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("@/components/ui/toast-custom", () => ({
  toastErro: mocks.toastErro,
  toastSucesso: mocks.toastSucesso,
}));

describe("useFeedbackLote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderizarHook() {
    return renderHook(() =>
      useFeedbackLote({
        mensagemSucesso: "Lote salvo com sucesso.",
        contextoErro: "salvar o lote",
      }),
    );
  }

  it("deve iniciar com o alerta fechado e sem mensagens", () => {
    const { result } = renderizarHook();

    expect(result.current.alertaProps).toEqual({
      aberto: false,
      titulo: "",
      mensagem: "",
      vinculados: [],
      onOpenChange: expect.any(Function),
    });
  });

  it("deve abrir o alerta para erro 400 com diretorias vinculadas", () => {
    const { result } = renderizarHook();

    const vinculados = [
      {
        id: 1,
        nome: "Diretoria Regional 1",
      },
      {
        id: 2,
        nome: "Diretoria Regional 2",
      },
    ];

    act(() => {
      result.current.tratarResultado({
        success: false,
        status: 400,
        title: "Diretorias já vinculadas",
        message: "Existem diretorias vinculadas a outro lote.",
        vinculados,
      } as never);
    });

    expect(result.current.alertaProps).toMatchObject({
      aberto: true,
      titulo: "Diretorias já vinculadas",
      mensagem: "Existem diretorias vinculadas a outro lote.",
      vinculados,
    });

    expect(mocks.toastErro).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("deve utilizar uma lista vazia quando o erro 400 não possuir vinculados", () => {
    const { result } = renderizarHook();

    act(() => {
      result.current.tratarResultado({
        success: false,
        status: 400,
        title: "Erro de validação",
        message: "Não foi possível salvar o lote.",
      } as never);
    });

    expect(result.current.alertaProps).toMatchObject({
      aberto: true,
      titulo: "Erro de validação",
      mensagem: "Não foi possível salvar o lote.",
      vinculados: [],
    });
  });

  it("deve exibir toast e redirecionar quando ocorrer erro diferente de 400", () => {
    const { result } = renderizarHook();

    act(() => {
      result.current.tratarResultado({
        success: false,
        status: 500,
        title: "Erro interno",
        message: "Ocorreu um erro no servidor.",
      } as never);
    });

    expect(mocks.toastErro).toHaveBeenCalledTimes(1);
    expect(mocks.toastErro).toHaveBeenCalledWith({
      titulo: "Erro interno",
      descricao: "Ocorreu um erro no servidor.",
    });

    expect(mocks.replace).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenCalledWith("/lotes");

    expect(result.current.alertaProps.aberto).toBe(false);
  });

  it("deve exibir toast de sucesso e redirecionar quando a operação funcionar", () => {
    const { result } = renderizarHook();

    act(() => {
      result.current.tratarResultado({
        success: true,
      } as never);
    });

    expect(mocks.toastSucesso).toHaveBeenCalledTimes(1);
    expect(mocks.toastSucesso).toHaveBeenCalledWith({
      titulo: "Sucesso!",
      descricao: "Lote salvo com sucesso.",
    });

    expect(mocks.replace).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenCalledWith("/lotes");
    expect(mocks.toastErro).not.toHaveBeenCalled();
  });

  it("deve permitir fechar o alerta por meio de onOpenChange", () => {
    const { result } = renderizarHook();

    act(() => {
      result.current.alertaProps.onOpenChange(true);
    });

    expect(result.current.alertaProps.aberto).toBe(true);

    act(() => {
      result.current.alertaProps.onOpenChange(false);
    });

    expect(result.current.alertaProps.aberto).toBe(false);
  });

  it("deve registrar e apresentar um erro inesperado", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { result } = renderizarHook();
    const erro = new Error("Falha inesperada");

    act(() => {
      result.current.tratarErroInesperado(erro);
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Erro inesperado ao salvar o lote:",
      erro,
    );

    expect(mocks.toastErro).toHaveBeenCalledTimes(1);
    expect(mocks.toastErro).toHaveBeenCalledWith({
      titulo: "Erro",
      descricao:
        "Não conseguimos salvar as alterações. Por favor, tente novamente.",
    });

    expect(mocks.replace).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
