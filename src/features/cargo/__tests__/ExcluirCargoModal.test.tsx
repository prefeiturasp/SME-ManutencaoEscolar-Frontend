import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExcluirCargoModal } from "../components/ExcluirCargoModal";

type PropsExcluirEntidadeModal = {
  titulo: string;
  textoBotao: string;
  mensagemSucesso: string;
  mensagemErro: string;
  rotaRetorno: string;
  loading: boolean;
  onExcluir: () => Promise<unknown>;
  onErro: (erro: unknown) => boolean;
};

type PropsAlertaErroVinculoCargo = {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  vinculados: {
    cpf: string;
    nome: string;
  }[];
  width?: number;
  onOpenChange: (aberto: boolean) => void;
};

const {
  useExcluirCargoMock,
  mutateAsyncMock,
  excluirEntidadeModalMock,
  alertaErroVinculoCargoMock,
} = vi.hoisted(() => ({
  useExcluirCargoMock: vi.fn(),
  mutateAsyncMock: vi.fn(),

  excluirEntidadeModalMock: vi.fn((_props: PropsExcluirEntidadeModal) => {
    void _props;
    return null;
  }),

  alertaErroVinculoCargoMock: vi.fn((_props: PropsAlertaErroVinculoCargo) => {
    void _props;
    return null;
  }),
}));

vi.mock("../hooks/useDeleteCargo", () => ({
  useExcluirCargo: useExcluirCargoMock,
}));

vi.mock("@/utils/ExcluirEntidadeModal", () => ({
  ExcluirEntidadeModal: excluirEntidadeModalMock,
}));

vi.mock("@/app/(cadastro)/cargos/components/AlertaErroVinculoCargo", () => ({
  AlertaErroVinculoCargo: alertaErroVinculoCargoMock,
}));

function obterPropsModal(): PropsExcluirEntidadeModal {
  return excluirEntidadeModalMock.mock.calls.at(-1)?.[0] as PropsExcluirEntidadeModal;
}

function obterPropsAlerta(): PropsAlertaErroVinculoCargo {
  return alertaErroVinculoCargoMock.mock.calls.at(-1)?.[0] as PropsAlertaErroVinculoCargo;
}

describe("ExcluirCargoModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mutateAsyncMock.mockResolvedValue({
      success: true,
    });

    useExcluirCargoMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    });
  });

  it("inicializa o hook com o UUID do cargo", () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    render(<ExcluirCargoModal uuid={uuid} />);

    expect(useExcluirCargoMock).toHaveBeenCalledTimes(1);
    expect(useExcluirCargoMock).toHaveBeenCalledWith(uuid);
  });

  it("configura o modal de exclusão do cargo", () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    render(<ExcluirCargoModal uuid={uuid} />);

    const propsModal = obterPropsModal();

    expect(propsModal).toEqual({
      titulo: "Excluir cargo?",
      textoBotao: "Excluir cargo",
      mensagemSucesso: "O cargo foi excluído.",
      mensagemErro: "Não conseguimos excluir o cargo. Por favor, tente novamente.",
      rotaRetorno: "/cargos",
      loading: false,
      onExcluir: mutateAsyncMock,
      onErro: expect.any(Function),
    });
  });

  it("repassa o estado pendente como loading", () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    useExcluirCargoMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: true,
    });

    render(<ExcluirCargoModal uuid={uuid} />);

    expect(obterPropsModal().loading).toBe(true);
  });

  it("repassa mutateAsync como função de exclusão", async () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    render(<ExcluirCargoModal uuid={uuid} />);

    await obterPropsModal().onExcluir();

    expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
  });

  it("inicia o alerta de vínculo fechado", () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    render(<ExcluirCargoModal uuid={uuid} />);

    expect(obterPropsAlerta()).toEqual({
      aberto: false,
      titulo: "Não é possível excluir o cargo",
      mensagem: "",
      vinculados: [],
      onOpenChange: expect.any(Function),
      width: 672,
    });
  });

  it("abre o alerta quando ocorre erro 400 de vínculo", () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    const erro = {
      success: false,
      status: 400,
      title: "Não é possível excluir o cargo",
      message: {
        message: "O cargo possui profissionais vinculados.",
        vinculados: [
          {
            cpf: "12345678910",
            nome: "João da Silva",
          },
        ],
      },
    };

    render(<ExcluirCargoModal uuid={uuid} />);

    let tratado = false;

    act(() => {
      tratado = obterPropsModal().onErro(erro);
    });

    expect(tratado).toBe(true);

    expect(obterPropsAlerta()).toEqual({
      aberto: true,
      titulo: "Não é possível excluir o cargo",
      mensagem: "O cargo possui profissionais vinculados.",
      vinculados: [
        {
          cpf: "12345678910",
          nome: "João da Silva",
        },
      ],
      onOpenChange: expect.any(Function),
      width: 672,
    });
  });

  it("não trata erro diferente de 400", () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    render(<ExcluirCargoModal uuid={uuid} />);

    let tratado = true;

    act(() => {
      tratado = obterPropsModal().onErro({
        success: false,
        status: 500,
      });
    });

    expect(tratado).toBe(false);
    expect(obterPropsAlerta().aberto).toBe(false);
  });

  it("mantém o alerta e seus dados quando onOpenChange recebe true", () => {
    const erro = {
      success: false,
      status: 400,
      title: "Cargo possui vínculos",
      message: {
        message: "O cargo possui profissionais vinculados.",
        vinculados: [
          {
            cpf: "12345678910",
            nome: "João da Silva",
          },
        ],
      },
    };

    render(<ExcluirCargoModal uuid="uuid-cargo" />);

    act(() => {
      obterPropsModal().onErro(erro);
    });

    act(() => {
      obterPropsAlerta().onOpenChange(true);
    });

    expect(obterPropsAlerta()).toEqual({
      aberto: true,
      titulo: "Cargo possui vínculos",
      mensagem: "O cargo possui profissionais vinculados.",
      vinculados: erro.message.vinculados,
      onOpenChange: expect.any(Function),
      width: 672,
    });
  });

  it("usa o título padrão e a lista vazia quando o erro 400 não os informa", () => {
    const erro = {
      success: false,
      status: 400,
      message: {
        message: "Não é possível excluir este cargo.",
      },
    };

    render(<ExcluirCargoModal uuid="uuid-cargo" />);

    let tratado = false;

    act(() => {
      tratado = obterPropsModal().onErro(erro);
    });

    expect(tratado).toBe(true);

    expect(obterPropsAlerta()).toEqual({
      aberto: true,
      titulo: "Não é possível excluir o cargo",
      mensagem: "Não é possível excluir este cargo.",
      vinculados: [],
      onOpenChange: expect.any(Function),
      width: 672,
    });
  });

  it("fecha e limpa o alerta de vínculo", () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    const erro = {
      success: false,
      status: 400,
      title: "Não é possível excluir o cargo",
      message: {
        message: "O cargo possui profissionais vinculados.",
        vinculados: [
          {
            cpf: "12345678910",
            nome: "João da Silva",
          },
        ],
      },
    };

    render(<ExcluirCargoModal uuid={uuid} />);

    act(() => {
      obterPropsModal().onErro(erro);
    });

    expect(obterPropsAlerta().aberto).toBe(true);

    act(() => {
      obterPropsAlerta().onOpenChange(false);
    });

    expect(obterPropsAlerta()).toEqual({
      aberto: false,
      titulo: "Não é possível excluir o cargo",
      mensagem: "",
      vinculados: [],
      onOpenChange: expect.any(Function),
      width: 672,
    });
  });
});
