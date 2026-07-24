import type React from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFormContext } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CadastrarServicoPage from "../page";

type DadosServico = {
  service_name: string;
  status: "ativo" | "inativo";
};

type ResultadoMutation =
  | {
      success: true;
      service?: unknown;
    }
  | {
      success: false;
      error?: string;
      title: string;
      message: string;
      status?: number;
    };

type MutationCallbacks = {
  onSuccess?: (resultado: ResultadoMutation) => void;
  onError?: (error: Error) => void;
};

const {
  mutateMock,
  breadcrumbMock,
  replaceMock,
  toastErroMock,
  toastSucessoMock,
} = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  breadcrumbMock: vi.fn(),
  replaceMock: vi.fn(),
  toastErroMock: vi.fn(),
  toastSucessoMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/components/ui/toast-custom", () => ({
  toastErro: toastErroMock,
  toastSucesso: toastSucessoMock,
}));

vi.mock("@/features/servico/hooks/useCriarServico", () => ({
  useCriarServico: () => ({
    mutate: mutateMock,
  }),
}));

vi.mock("@/components/navigation/Breadcrumb/Breadcrumb", () => ({
  Breadcrumb: (props: {
    itens: Array<{
      rotulo: string;
      caminho?: string;
      paginaAtual?: boolean;
      icone?: React.ReactNode;
    }>;
    className?: string;
  }) => {
    breadcrumbMock(props);

    return <nav aria-label="breadcrumb" />;
  },
}));

vi.mock("@/components/icons/HomeIcon", () => ({
  HomeIcon: ({ className }: { className?: string }) => (
    <svg data-testid="home-icon" className={className} />
  ),
}));

vi.mock("@/features/servico/components/ServicoForm/FormServico", () => ({
  FormServico: () => {
    const { register } = useFormContext<DadosServico>();

    return (
      <>
        <label htmlFor="service_name">Serviço</label>

        <input id="service_name" {...register("service_name")} />

        <label htmlFor="status">Status</label>

        <select id="status" {...register("status")}>
          <option value="">Selecione</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </>
    );
  },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild: _asChild,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    variant?: string;
    size?: string;
  }) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <section>{children}</section>
  ),

  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({
    open,
    children,
    onOpenChange,
  }: {
    open: boolean;
    children: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
  }) =>
    open ? (
      <div role="alertdialog" data-testid="alert-dialog">
        {children}

        <button
          type="button"
          data-testid="mock-close-dialog"
          onClick={() => onOpenChange?.(false)}
        >
          Fechar modal mock
        </button>
      </div>
    ) : null,

  AlertDialogContent: ({
    children,
  }: {
    children: React.ReactNode;
    className?: string;
    size?: string;
  }) => <div>{children}</div>,

  AlertDialogHeader: ({
    children,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <header>{children}</header>,

  AlertDialogTitle: ({
    children,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <h2>{children}</h2>,

  AlertDialogDescription: ({
    children,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <p>{children}</p>,

  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <footer>{children}</footer>
  ),

  AlertDialogAction: ({
    children,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <>{children}</>,

  AlertDialogCancel: ({
    children,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <>{children}</>,
}));

async function preencherFormulario(
  user: ReturnType<typeof userEvent.setup>,
  nome = "Jardinagem",
  status: "ativo" | "inativo" = "ativo",
) {
  await user.type(
    screen.getByRole("textbox", {
      name: "Serviço",
    }),
    nome,
  );

  await user.selectOptions(
    screen.getByRole("combobox", {
      name: "Status",
    }),
    status,
  );
}

describe("CadastrarServicoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o título e as instruções da página", () => {
    render(<CadastrarServicoPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Cadastro de Serviço",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /preencha as informações e clique em “cadastrar serviço” para armazenar os dados/i,
      ),
    ).toBeInTheDocument();
  });

  it("deve enviar os itens corretos para o breadcrumb", () => {
    render(<CadastrarServicoPage />);

    expect(breadcrumbMock).toHaveBeenCalled();

    const props = breadcrumbMock.mock.calls.at(-1)?.[0];

    expect(props).toBeDefined();
    expect(props.className).toBe("mb-8");
    expect(props.itens).toHaveLength(4);

    expect(props.itens[0]).toMatchObject({
      rotulo: "Início",
      caminho: "/dashboard",
    });

    expect(props.itens[0].icone).toBeDefined();

    expect(props.itens[1]).toMatchObject({
      rotulo: "Cadastro",
      caminho: "/dashboard/cadastro",
    });

    expect(props.itens[2]).toMatchObject({
      rotulo: "Serviços",
      caminho: "/dashboard/cadastro/servicos",
    });

    expect(props.itens[3]).toMatchObject({
      rotulo: "Cadastrar Serviço",
      paginaAtual: true,
    });
  });

  it("deve iniciar com o botão cadastrar desabilitado", () => {
    render(<CadastrarServicoPage />);

    expect(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    ).toBeDisabled();
  });

  it("deve habilitar o botão quando o formulário estiver válido", async () => {
    const user = userEvent.setup();

    render(<CadastrarServicoPage />);

    await preencherFormulario(user);

    expect(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    ).toBeEnabled();
  });

  it("deve enviar os dados preenchidos para a mutation", async () => {
    const user = userEvent.setup();

    render(<CadastrarServicoPage />);

    await preencherFormulario(user, "Jardinagem", "ativo");

    await user.click(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    );

    expect(mutateMock).toHaveBeenCalledTimes(1);

    expect(mutateMock).toHaveBeenCalledWith(
      {
        service_name: "Jardinagem",
        status: "ativo",
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("deve exibir toast de sucesso quando o serviço for cadastrado", async () => {
    const user = userEvent.setup();

    mutateMock.mockImplementation(
      (_dados: DadosServico, callbacks: MutationCallbacks) => {
        callbacks.onSuccess?.({
          success: true,
        });
      },
    );

    render(<CadastrarServicoPage />);

    await preencherFormulario(user);

    await user.click(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    );

    expect(toastSucessoMock).toHaveBeenCalledTimes(1);

    expect(toastSucessoMock).toHaveBeenCalledWith({
      titulo: "Sucesso",
      descricao: "O serviço foi cadastrado.",
    });

    expect(toastErroMock).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("deve abrir o alerta com os dados retornados em erro 400", async () => {
    const user = userEvent.setup();

    mutateMock.mockImplementation(
      (_dados: DadosServico, callbacks: MutationCallbacks) => {
        callbacks.onSuccess?.({
          success: false,
          error: "api-error",
          status: 400,
          title: "Não é possível criar o serviço",
          message: "Já existe um serviço com este nome cadastrado no sistema.",
        });
      },
    );

    render(<CadastrarServicoPage />);

    await preencherFormulario(user);

    await user.click(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Não é possível criar o serviço",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Já existe um serviço com este nome cadastrado no sistema.",
      ),
    ).toBeInTheDocument();

    expect(toastErroMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve fechar o alerta quando onOpenChange receber false", async () => {
    const user = userEvent.setup();

    mutateMock.mockImplementation(
      (_dados: DadosServico, callbacks: MutationCallbacks) => {
        callbacks.onSuccess?.({
          success: false,
          error: "api-error",
          status: 400,
          title: "Não é possível criar o serviço",
          message: "O serviço já está cadastrado.",
        });
      },
    );

    render(<CadastrarServicoPage />);

    await preencherFormulario(user);

    await user.click(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    await user.click(screen.getByTestId("mock-close-dialog"));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("deve exibir toast de erro e redirecionar quando retornar status 500", async () => {
    const user = userEvent.setup();

    mutateMock.mockImplementation(
      (_dados: DadosServico, callbacks: MutationCallbacks) => {
        callbacks.onSuccess?.({
          success: false,
          error: "api-error",
          status: 500,
          title: "Erro interno",
          message: "Não conseguimos cadastrar o serviço.",
        });
      },
    );

    render(<CadastrarServicoPage />);

    await preencherFormulario(user, "Pintura", "inativo");

    await user.click(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    );

    expect(toastErroMock).toHaveBeenCalledTimes(1);

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Erro interno",
      descricao: "Não conseguimos cadastrar o serviço.",
    });

    expect(replaceMock).toHaveBeenCalledWith("/dashboard/cadastro/servicos");

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("deve usar valores padrão no toast de erro 500", async () => {
    const user = userEvent.setup();

    mutateMock.mockImplementation(
      (_dados: DadosServico, callbacks: MutationCallbacks) => {
        callbacks.onSuccess?.({
          success: false,
          error: "api-error",
          status: 500,
          title: undefined as unknown as string,
          message: undefined as unknown as string,
        });
      },
    );

    render(<CadastrarServicoPage />);

    await preencherFormulario(user);

    await user.click(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    );

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Erro",
      descricao:
        "Não conseguimos cadastrar o serviço. Por favor, tente novamente.",
    });
  });

  it("deve registrar erro inesperado no console", async () => {
    const user = userEvent.setup();
    const erro = new Error("Falha inesperada");

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mutateMock.mockImplementation(
      (_dados: DadosServico, callbacks: MutationCallbacks) => {
        callbacks.onError?.(erro);
      },
    );

    render(<CadastrarServicoPage />);

    await preencherFormulario(user);

    await user.click(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    );

    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Erro inesperado ao cadastrar serviço:",
      erro,
    );

    expect(toastErroMock).not.toHaveBeenCalled();
    expect(toastSucessoMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();

    consoleErrorMock.mockRestore();
  });
});
