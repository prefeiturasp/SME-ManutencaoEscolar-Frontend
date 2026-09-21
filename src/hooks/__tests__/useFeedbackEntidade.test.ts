import { act, renderHook } from "@testing-library/react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { toastErro, toastSucesso } from "@/components/ui/toast-custom";

import { useFeedbackEntidade } from "@/hooks/useFeedbackEntidade";

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

type Vinculado = {
  id: number;
  nome: string;
};

const propriedades = {
  mensagemSucesso: "As alterações foram salvas.",
  contextoErro: "editar cargo",
  rotaRetorno: "/cargos",
};

describe("useFeedbackEntidade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna o estado inicial do alerta", () => {
    const { result } = renderHook(() =>
      useFeedbackEntidade<Vinculado>(propriedades),
    );

    expect(result.current.alertaProps).toEqual({
      aberto: false,
      titulo: "",
      mensagem: "",
      vinculados: [],
      onOpenChange: expect.any(Function),
    });

    expect(result.current.tratarResultado).toEqual(expect.any(Function));

    expect(result.current.tratarErroInesperado).toEqual(expect.any(Function));
  });

  it("exibe a mensagem de sucesso e redireciona", () => {
    const { result } = renderHook(() =>
      useFeedbackEntidade<Vinculado>(propriedades),
    );

    act(() => {
      result.current.tratarResultado({
        success: true,
      });
    });

    expect(toastSucesso).toHaveBeenCalledExactlyOnceWith({
      titulo: "Sucesso!",
      descricao: "As alterações foram salvas.",
    });

    expect(mocks.replace).toHaveBeenCalledExactlyOnceWith("/cargos");

    expect(toastErro).not.toHaveBeenCalled();

    expect(result.current.alertaProps.aberto).toBe(false);
  });

  it("abre o alerta quando recebe erro 400", () => {
    const vinculados: Vinculado[] = [
      {
        id: 1,
        nome: "Eletricista",
      },
      {
        id: 2,
        nome: "Engenheiro",
      },
    ];

    const { result } = renderHook(() =>
      useFeedbackEntidade<Vinculado>(propriedades),
    );

    act(() => {
      result.current.tratarResultado({
        success: false,
        status: 400,
        title: "Cargo já cadastrado",
        message: "Já existe um cargo com o nome informado.",
        vinculados,
      });
    });

    expect(result.current.alertaProps).toEqual({
      aberto: true,
      titulo: "Cargo já cadastrado",
      mensagem: "Já existe um cargo com o nome informado.",
      vinculados,
      onOpenChange: expect.any(Function),
    });

    expect(toastSucesso).not.toHaveBeenCalled();
    expect(toastErro).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("utiliza os valores padrão no alerta do erro 400", () => {
    const { result } = renderHook(() =>
      useFeedbackEntidade<Vinculado>(propriedades),
    );

    act(() => {
      result.current.tratarResultado({
        success: false,
        status: 400,
      });
    });

    expect(result.current.alertaProps.aberto).toBe(true);
    expect(result.current.alertaProps.titulo).toBe("Erro");
    expect(result.current.alertaProps.mensagem).toBe("");
    expect(result.current.alertaProps.vinculados).toEqual([]);

    expect(toastErro).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("permite fechar o alerta pelo onOpenChange", () => {
    const { result } = renderHook(() =>
      useFeedbackEntidade<Vinculado>(propriedades),
    );

    act(() => {
      result.current.tratarResultado({
        success: false,
        status: 400,
        title: "Dados inválidos",
        message: "Verifique os dados informados.",
      });
    });

    expect(result.current.alertaProps.aberto).toBe(true);

    act(() => {
      result.current.alertaProps.onOpenChange(false);
    });

    expect(result.current.alertaProps.aberto).toBe(false);
  });

  it("permite abrir o alerta diretamente pelo onOpenChange", () => {
    const { result } = renderHook(() =>
      useFeedbackEntidade<Vinculado>(propriedades),
    );

    expect(result.current.alertaProps.aberto).toBe(false);

    act(() => {
      result.current.alertaProps.onOpenChange(true);
    });

    expect(result.current.alertaProps.aberto).toBe(true);
  });

  it("exibe toast e redireciona quando recebe erro diferente de 400", () => {
    const { result } = renderHook(() =>
      useFeedbackEntidade<Vinculado>(propriedades),
    );

    act(() => {
      result.current.tratarResultado({
        success: false,
        status: 500,
        title: "Erro no servidor",
        message: "Não foi possível atualizar o cargo.",
      });
    });

    expect(toastErro).toHaveBeenCalledExactlyOnceWith({
      titulo: "Erro no servidor",
      descricao: "Não foi possível atualizar o cargo.",
    });

    expect(mocks.replace).toHaveBeenCalledExactlyOnceWith("/cargos");

    expect(toastSucesso).not.toHaveBeenCalled();
    expect(result.current.alertaProps.aberto).toBe(false);
  });

  it("utiliza título e mensagem padrão quando o erro não possui detalhes", () => {
    const { result } = renderHook(() =>
      useFeedbackEntidade<Vinculado>(propriedades),
    );

    act(() => {
      result.current.tratarResultado({
        success: false,
        status: 500,
      });
    });

    expect(toastErro).toHaveBeenCalledExactlyOnceWith({
      titulo: "Erro",
      descricao: "Não foi possível salvar.",
    });

    expect(mocks.replace).toHaveBeenCalledExactlyOnceWith("/cargos");
  });

  it("trata como erro comum quando o status não é informado", () => {
    const { result } = renderHook(() =>
      useFeedbackEntidade<Vinculado>(propriedades),
    );

    act(() => {
      result.current.tratarResultado({
        success: false,
        title: "Falha na operação",
        message: "Não foi possível concluir a operação.",
      });
    });

    expect(toastErro).toHaveBeenCalledExactlyOnceWith({
      titulo: "Falha na operação",
      descricao: "Não foi possível concluir a operação.",
    });

    expect(mocks.replace).toHaveBeenCalledExactlyOnceWith("/cargos");
  });

  it("trata erros inesperados", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const erro = new Error("Falha inesperada");

    const { result } = renderHook(() =>
      useFeedbackEntidade<Vinculado>(propriedades),
    );

    act(() => {
      result.current.tratarErroInesperado(erro);
    });

    expect(consoleError).toHaveBeenCalledExactlyOnceWith(
      "Erro inesperado ao editar cargo:",
      erro,
    );

    expect(toastErro).toHaveBeenCalledExactlyOnceWith({
      titulo: "Erro",
      descricao:
        "Não conseguimos salvar as alterações. Por favor, tente novamente.",
    });

    expect(toastSucesso).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("utiliza o contexto recebido ao registrar erro inesperado", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const erro = {
      codigo: "ERRO_DESCONHECIDO",
    };

    const { result } = renderHook(() =>
      useFeedbackEntidade({
        mensagemSucesso: "Cadastro realizado.",
        contextoErro: "cadastrar fornecedor",
        rotaRetorno: "/fornecedores",
      }),
    );

    act(() => {
      result.current.tratarErroInesperado(erro);
    });

    expect(consoleError).toHaveBeenCalledExactlyOnceWith(
      "Erro inesperado ao cadastrar fornecedor:",
      erro,
    );

    consoleError.mockRestore();
  });

  it("utiliza a rota de retorno recebida pelo hook", () => {
    const { result } = renderHook(() =>
      useFeedbackEntidade({
        mensagemSucesso: "Cadastro realizado.",
        contextoErro: "cadastrar fornecedor",
        rotaRetorno: "/fornecedores",
      }),
    );

    act(() => {
      result.current.tratarResultado({
        success: true,
      });
    });

    expect(mocks.replace).toHaveBeenCalledExactlyOnceWith("/fornecedores");

    expect(toastSucesso).toHaveBeenCalledExactlyOnceWith({
      titulo: "Sucesso!",
      descricao: "Cadastro realizado.",
    });
  });
});
