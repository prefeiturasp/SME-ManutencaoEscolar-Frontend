import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EditarServicoForm } from "@/features/servico/components/Servico/EditarServicoForm";
import type { Servico } from "@/features/servico/types/servicos.types";
import { act } from "react";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  editarServico: vi.fn(),
  useEditarServico: vi.fn(),
  toastErro: vi.fn(),
  toastSucesso: vi.fn(),
}));

vi.mock("@/features/servico/components/Servico/ExcluirServicoModal", () => ({
  ExcluirServicoModal: () => <button type="button">Excluir</button>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("@/features/servico/hooks/useEditarServico", () => ({
  useEditarServico: mocks.useEditarServico,
}));

vi.mock("@/components/ui/toast-custom", () => ({
  toastErro: mocks.toastErro,
  toastSucesso: mocks.toastSucesso,
}));

vi.mock("@/features/servico/components/Servico/FormServico", async () => {
  const { useFormContext } = await import("react-hook-form");

  return {
    FormServico: () => {
      const { register } = useFormContext();

      return (
        <div>
          <label htmlFor="nome">Serviço</label>
          <input id="nome" {...register("nome")} />

          <label htmlFor="status">Status</label>
          <select id="status" {...register("status")}>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>
      );
    },
  };
});

const uuid = "07f14275-59ee-4e67-812a-d5aaa2cedb62";

const servico = {
  id: 1,
  uuid,
  nome: "Pintura",
  status: true,
  criado_por: 1,
  criado_por_nome: "Matheus",
  criado_em: "2026-08-12T21:21:00Z",
  atualizado_por: 2,
  atualizado_por_nome: "João",
  username: "44331733621",
  atualizado_em: "2026-08-13T14:02:00Z",
} as Servico;

function configurarMutation(isPending = false) {
  mocks.useEditarServico.mockReturnValue({
    mutate: mocks.editarServico,
    isPending,
  });
}

async function alterarNome(novoNome = "Pintura externa") {
  const user = userEvent.setup();

  const inputNome = screen.getByRole("textbox", {
    name: "Serviço",
  });

  await user.clear(inputNome);
  await user.type(inputNome, novoNome);

  return user;
}

function obterLinhaAuditoria(tipo: "INSERIDO" | "ALTERADO") {
  return screen.getByText((_conteudo, elemento) => {
    return (
      elemento?.tagName === "P" &&
      elemento.textContent?.includes(`${tipo} por`) === true
    );
  });
}

describe("EditarServicoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configurarMutation();
  });

  it("deve renderizar os dados iniciais do serviço", () => {
    render(<EditarServicoForm uuid={uuid} servico={servico} />);

    expect(
      screen.getByRole("heading", {
        name: "Editar Serviço",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", {
        name: "Serviço",
      }),
    ).toHaveValue("Pintura");

    expect(
      screen.getByRole("combobox", {
        name: "Status",
      }),
    ).toHaveValue("true");

    const linhaInserido = obterLinhaAuditoria("INSERIDO");
    const linhaAlterado = obterLinhaAuditoria("ALTERADO");

    expect(linhaInserido).toHaveTextContent("INSERIDO por Matheus");
    expect(linhaInserido).toHaveTextContent("12/08/2026 às 18:21");

    expect(linhaAlterado).toHaveTextContent("ALTERADO por João");
    expect(linhaAlterado).toHaveTextContent("13/08/2026 às 11:02");
  });

  it("deve renderizar o link de cancelamento", () => {
    render(<EditarServicoForm uuid={uuid} servico={servico} />);

    expect(
      screen.getByRole("link", {
        name: "Cancelar",
      }),
    ).toHaveAttribute("href", "/cadastro/servicos");
  });

  it("deve manter o botão salvar desabilitado sem alterações", () => {
    render(<EditarServicoForm uuid={uuid} servico={servico} />);

    expect(
      screen.getByRole("button", {
        name: "Salvar",
      }),
    ).toBeDisabled();
  });

  it("deve habilitar o botão salvar após uma alteração válida", async () => {
    render(<EditarServicoForm uuid={uuid} servico={servico} />);

    await alterarNome();

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Salvar",
        }),
      ).toBeEnabled();
    });
  });

  it("deve chamar a edição com os dados preenchidos", async () => {
    render(<EditarServicoForm uuid={uuid} servico={servico} />);

    const user = await alterarNome();

    const botaoSalvar = await screen.findByRole("button", {
      name: "Salvar",
    });

    await waitFor(() => {
      expect(botaoSalvar).toBeEnabled();
    });

    await user.click(botaoSalvar);

    await waitFor(() => {
      expect(mocks.editarServico).toHaveBeenCalledTimes(1);
    });

    expect(mocks.editarServico).toHaveBeenCalledWith(
      {
        nome: "Pintura externa",
        status: "true",
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("deve exibir sucesso e navegar após editar", async () => {
    render(<EditarServicoForm uuid={uuid} servico={servico} />);

    const user = await alterarNome();

    await user.click(
      await screen.findByRole("button", {
        name: "Salvar",
      }),
    );

    await waitFor(() => {
      expect(mocks.editarServico).toHaveBeenCalledTimes(1);
    });

    const opcoes = mocks.editarServico.mock.calls[0][1] as {
      onSuccess: (resultado: {
        success: boolean;
        title?: string;
        message?: string;
      }) => void;
    };

    opcoes.onSuccess({
      success: true,
    });

    expect(mocks.toastSucesso).toHaveBeenCalledWith({
      titulo: "Sucesso!",
      descricao: "As alterações foram salvas.",
    });

    expect(mocks.replace).toHaveBeenCalledWith("/cadastro/servicos");

    expect(mocks.toastErro).not.toHaveBeenCalled();
  });

  it("deve exibir o erro retornado pela API", async () => {
    render(<EditarServicoForm uuid={uuid} servico={servico} />);

    const user = await alterarNome();

    await user.click(
      await screen.findByRole("button", {
        name: "Salvar",
      }),
    );

    await waitFor(() => {
      expect(mocks.editarServico).toHaveBeenCalledTimes(1);
    });

    const opcoes = mocks.editarServico.mock.calls[0][1] as {
      onSuccess: (resultado: {
        success: boolean;
        status: number;
        title: string;
        message: string;
      }) => void;
    };

    act(() => {
      opcoes.onSuccess({
        success: false,
        status: 400,
        title: "Serviço já cadastrado",
        message: "Já existe um serviço com esse nome.",
      });
    });

    expect(
      await screen.findByRole("heading", {
        name: "Serviço já cadastrado",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Já existe um serviço com esse nome."),
    ).toBeInTheDocument();

    expect(mocks.toastErro).not.toHaveBeenCalled();
    expect(mocks.toastSucesso).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("deve tratar erros inesperados da mutation", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(<EditarServicoForm uuid={uuid} servico={servico} />);

    const user = await alterarNome();

    await user.click(
      await screen.findByRole("button", {
        name: "Salvar",
      }),
    );

    await waitFor(() => {
      expect(mocks.editarServico).toHaveBeenCalledTimes(1);
    });

    const opcoes = mocks.editarServico.mock.calls[0][1] as {
      onError: (error: Error) => void;
    };

    const error = new Error("Falha inesperada");

    opcoes.onError(error);

    expect(consoleError).toHaveBeenCalledWith(
      "Erro inesperado ao editar serviço:",
      error,
    );

    expect(mocks.toastErro).toHaveBeenCalledWith({
      titulo: "Erro",
      descricao:
        "Não conseguimos salvar as alterações. Por favor, tente novamente.",
    });

    expect(mocks.replace).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("deve mostrar não informado para dados ausentes ou inválidos", () => {
    const servicoSemAuditoria: Servico = {
      ...servico,
      status: false,
      criado_por_nome: null,
      criado_em: undefined,
      atualizado_por_nome: null,
      atualizado_em: "data-invalida",
    };

    render(<EditarServicoForm uuid={uuid} servico={servicoSemAuditoria} />);

    expect(
      screen.getByRole("combobox", {
        name: "Status",
      }),
    ).toHaveValue("false");

    const linhaInserido = obterLinhaAuditoria("INSERIDO");
    const linhaAlterado = obterLinhaAuditoria("ALTERADO");

    expect(linhaInserido).toHaveTextContent(/INSERIDO por Não informado/);
    expect(linhaInserido).toHaveTextContent(/em\s+Não informado/);

    expect(linhaAlterado).toHaveTextContent(/ALTERADO por Não informado/);
    expect(linhaAlterado).toHaveTextContent(/em\s+Não informado/);
  });

  it("deve passar o UUID para o hook de edição", () => {
    render(<EditarServicoForm uuid={uuid} servico={servico} />);

    expect(mocks.useEditarServico).toHaveBeenCalledWith(uuid);
  });

  it("deve usar valor vazio quando uma parte da data não for encontrada", () => {
    const formatToParts = vi
      .spyOn(Intl.DateTimeFormat.prototype, "formatToParts")
      .mockReturnValue([
        {
          type: "day",
          value: "12",
        },
        {
          type: "month",
          value: "08",
        },
        {
          type: "year",
          value: "2026",
        },
        {
          type: "hour",
          value: "18",
        },
      ]);

    try {
      render(<EditarServicoForm uuid={uuid} servico={servico} />);

      const linhaInserido = obterLinhaAuditoria("INSERIDO");

      expect(linhaInserido).toHaveTextContent("12/08/2026 às 18:");

      expect(linhaInserido.textContent?.trim()).toMatch(/12\/08\/2026 às 18:$/);
    } finally {
      formatToParts.mockRestore();
    }
  });

  it("deve exibir as mensagens padrão retornadas pelo service", async () => {
    render(<EditarServicoForm uuid={uuid} servico={servico} />);

    const user = await alterarNome();

    await user.click(
      await screen.findByRole("button", {
        name: "Salvar",
      }),
    );

    await waitFor(() => {
      expect(mocks.editarServico).toHaveBeenCalledTimes(1);
    });

    const opcoes = mocks.editarServico.mock.calls[0][1] as {
      onSuccess: (resultado: {
        success: boolean;
        status: number;
        title: string;
        message: string;
      }) => void;
    };

    act(() => {
      opcoes.onSuccess({
        success: false,
        status: 500,
        title: "Erro",
        message:
          "Não conseguimos salvar as alterações. Por favor, tente novamente.",
      });
    });

    expect(mocks.toastErro).toHaveBeenCalledWith({
      titulo: "Erro",
      descricao:
        "Não conseguimos salvar as alterações. Por favor, tente novamente.",
    });

    expect(mocks.toastSucesso).not.toHaveBeenCalled();

    expect(mocks.replace).toHaveBeenCalledWith("/cadastro/servicos");
  });
});
