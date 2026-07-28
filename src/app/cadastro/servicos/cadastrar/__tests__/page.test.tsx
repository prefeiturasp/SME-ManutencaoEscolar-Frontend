import type { ReactNode } from "react";

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CadastrarServicoPage from "../page";

type ResultadoMutation =
  | {
      success: true;
      service: {
        id: number;
        uuid: string;
        nome: string;
        status: boolean;
      };
    }
  | {
      success: false;
      error: "api-error";
      title?: string;
      message?: string;
      status?: number;
    };

type MutationOptions = {
  onSuccess: (resultado: ResultadoMutation) => void;
  onError: (error: Error) => void;
};

type AlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

const {
  mutateMock,
  replaceMock,
  toastSucessoMock,
  toastErroMock,
  alertDialogMock,
} = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  replaceMock: vi.fn(),
  toastSucessoMock: vi.fn(),
  toastErroMock: vi.fn(),
  alertDialogMock: vi.fn(),
}));

vi.mock("@/features/servico/hooks/useCriarServico", () => ({
  useCriarServico: () => ({
    mutate: mutateMock,
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/cadastro/servicos/cadastrar",
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/ui/toast-custom", () => ({
  toastSucesso: toastSucessoMock,
  toastErro: toastErroMock,
}));

vi.mock("@/components/icons/HomeIcon", () => ({
  HomeIcon: () => <svg data-testid="home-icon" />,
}));

vi.mock("@/features/servico/components/ServicoForm/FormServico", async () => {
  const { useFormContext } = await import("react-hook-form");

  function FormServicoMock() {
    const { register } = useFormContext();

    return (
      <div>
        <label htmlFor="nome">Serviço</label>

        <input id="nome" {...register("nome")} />

        <label htmlFor="status">Status</label>

        <select
          id="status"
          defaultValue=""
          {...register("status", {
            setValueAs: (value) => {
              if (value === "") {
                return undefined;
              }

              return value === "true";
            },
          })}
        >
          <option value="">Selecione</option>

          <option value="true">Ativo</option>

          <option value="false">Inativo</option>
        </select>
      </div>
    );
  }

  return {
    FormServico: FormServicoMock,
  };
});

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: (props: AlertDialogProps) => {
    alertDialogMock(props);

    if (!props.open) {
      return null;
    }

    return <div role="dialog">{props.children}</div>;
  },

  AlertDialogContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),

  AlertDialogHeader: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),

  AlertDialogTitle: ({ children }: { children: ReactNode }) => (
    <h2>{children}</h2>
  ),

  AlertDialogDescription: ({ children }: { children: ReactNode }) => (
    <p>{children}</p>
  ),

  AlertDialogFooter: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),

  AlertDialogCancel: ({ children }: { children: ReactNode }) => <>{children}</>,

  AlertDialogAction: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

async function preencherFormulario(status: "true" | "false" = "true") {
  const user = userEvent.setup();

  await user.type(
    screen.getByRole("textbox", {
      name: "Serviço",
    }),
    "Pintura",
  );

  await user.selectOptions(
    screen.getByRole("combobox", {
      name: "Status",
    }),
    status,
  );

  return user;
}

describe("CadastrarServicoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar os elementos principais", () => {
    render(<CadastrarServicoPage />);

    expect(
      screen.getByRole("heading", {
        name: "Cadastro de Serviço",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/preencha as informações e clique/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cancelar",
      }),
    ).toHaveAttribute("href", "/cadastro/servicos/");
  });

  it("deve iniciar com o botão desabilitado", () => {
    render(<CadastrarServicoPage />);

    expect(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    ).toBeDisabled();
  });

  it("deve habilitar o botão quando o formulário estiver válido", async () => {
    render(<CadastrarServicoPage />);

    await preencherFormulario();

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Cadastrar serviço",
        }),
      ).toBeEnabled();
    });
  });

  it("deve enviar status true e exibir o toast de sucesso", async () => {
    mutateMock.mockImplementation(
      (_dados: unknown, options: MutationOptions) => {
        options.onSuccess({
          success: true,
          service: {
            id: 1,
            uuid: "2e7d7d7d-9b8b-4c92-9b3b-123456789abc",
            nome: "Pintura",
            status: true,
          },
        });
      },
    );

    render(<CadastrarServicoPage />);

    const user = await preencherFormulario("true");

    await user.click(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    );

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1);
    });

    expect(mutateMock).toHaveBeenCalledWith(
      {
        nome: "Pintura",
        status: true,
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );

    expect(toastSucessoMock).toHaveBeenCalledWith({
      titulo: "Sucesso",
      descricao: "O serviço foi cadastrado.",
    });

    expect(toastErroMock).not.toHaveBeenCalled();
  });

  it("deve enviar status false para serviço inativo", async () => {
    mutateMock.mockImplementation(
      (_dados: unknown, options: MutationOptions) => {
        options.onSuccess({
          success: true,
          service: {
            id: 2,
            uuid: "7b48792f-e28c-4471-a91a-123456789abc",
            nome: "Pintura",
            status: false,
          },
        });
      },
    );

    render(<CadastrarServicoPage />);

    const user = await preencherFormulario("false");

    await user.click(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    );

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        {
          nome: "Pintura",
          status: false,
        },
        expect.any(Object),
      );
    });
  });

  it("deve abrir o alerta quando retornar erro 400", async () => {
    mutateMock.mockImplementation(
      (_dados: unknown, options: MutationOptions) => {
        options.onSuccess({
          success: false,
          error: "api-error",
          status: 400,
          title: "Serviço já cadastrado",
          message: "Já existe um serviço com esse nome.",
        });
      },
    );

    render(<CadastrarServicoPage />);

    const user = await preencherFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    );

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Serviço já cadastrado",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Já existe um serviço com esse nome."),
    ).toBeInTheDocument();
  });

  it("deve fechar o alerta quando onOpenChange receber false", async () => {
    mutateMock.mockImplementation(
      (_dados: unknown, options: MutationOptions) => {
        options.onSuccess({
          success: false,
          error: "api-error",
          status: 400,
          title: "Serviço já cadastrado",
          message: "Já existe um serviço com esse nome.",
        });
      },
    );

    render(<CadastrarServicoPage />);

    const user = await preencherFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    );

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    const ultimaChamada = alertDialogMock.mock.calls.at(-1)?.[0] as
      | AlertDialogProps
      | undefined;

    expect(ultimaChamada).toBeDefined();

    act(() => {
      ultimaChamada?.onOpenChange(false);
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("deve exibir toast de erro e redirecionar no erro 500", async () => {
    mutateMock.mockImplementation(
      (_dados: unknown, options: MutationOptions) => {
        options.onSuccess({
          success: false,
          error: "api-error",
          status: 500,
          title: "Erro no servidor",
          message: "Não foi possível cadastrar o serviço.",
        });
      },
    );

    render(<CadastrarServicoPage />);

    const user = await preencherFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    );

    await waitFor(() => {
      expect(toastErroMock).toHaveBeenCalledWith({
        titulo: "Erro no servidor",
        descricao: "Não foi possível cadastrar o serviço.",
      });
    });

    expect(replaceMock).toHaveBeenCalledWith("/cadastro/servicos");
  });

  it("deve usar os valores padrão no erro 500", async () => {
    mutateMock.mockImplementation(
      (_dados: unknown, options: MutationOptions) => {
        options.onSuccess({
          success: false,
          error: "api-error",
          status: 500,
          title: undefined,
          message: undefined,
        });
      },
    );

    render(<CadastrarServicoPage />);

    const user = await preencherFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    );

    await waitFor(() => {
      expect(toastErroMock).toHaveBeenCalledWith({
        titulo: "Erro",
        descricao:
          "Não conseguimos cadastrar o serviço. Por favor, tente novamente.",
      });
    });

    expect(replaceMock).toHaveBeenCalledWith("/cadastro/servicos");
  });

  it("deve registrar erro inesperado no console", async () => {
    const error = new Error("Falha inesperada");

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    mutateMock.mockImplementation(
      (_dados: unknown, options: MutationOptions) => {
        options.onError(error);
      },
    );

    render(<CadastrarServicoPage />);

    const user = await preencherFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Cadastrar serviço",
      }),
    );

    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith(
        "Erro inesperado ao cadastrar serviço:",
        error,
      );
    });
  });
});
