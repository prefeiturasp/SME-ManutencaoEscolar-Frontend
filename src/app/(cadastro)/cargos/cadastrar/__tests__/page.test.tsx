import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ButtonHTMLAttributes, FormEvent, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

type DadosFormulario = {
  nome: string;
  exige_documento?: "true" | "false";
  novo_documento?: string;
  documentos?: Array<{
    nome: string;
  }>;
};

type ResultadoMutation =
  | {
      success: true;
      cargo: {
        id: number;
        nome: string;
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
  onError: (error: unknown) => void;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
  size?: string;
  variant?: string;
};

type AlertaErroProps = {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  onOpenChange: (aberto: boolean) => void;
};

const {
  mutateMock,
  replaceMock,
  toastErroMock,
  toastSucessoMock,
  useCriarCargoMock,
  useFormMock,
  zodResolverMock,
} = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  replaceMock: vi.fn(),
  toastErroMock: vi.fn(),
  toastSucessoMock: vi.fn(),
  useCriarCargoMock: vi.fn(),
  useFormMock: vi.fn(),
  zodResolverMock: vi.fn(),
}));

let dadosFormulario: DadosFormulario;
let formularioValido: boolean;
let formularioEnviando: boolean;
let mutationPendente: boolean;

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: zodResolverMock,
}));

vi.mock("react-hook-form", () => ({
  FormProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="form-provider">{children}</div>
  ),

  useForm: useFormMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/features/cargo/hooks/useCriarCargo", () => ({
  useCriarCargo: useCriarCargoMock,
}));

vi.mock("@/features/cargo/components/FormCargo", () => ({
  FormCargo: () => <div data-testid="form-cargo">Formulário de cargo</div>,
}));

vi.mock("@/components/ui/toast-custom", () => ({
  toastErro: toastErroMock,
  toastSucesso: toastSucessoMock,
}));

vi.mock("@/app/(cadastro)/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => (
    <div data-testid="cadastro-breadcrumb">Breadcrumb</div>
  ),
}));

vi.mock("@/components/shared/AlertaErro/AlertaErro", () => ({
  AlertaErro: ({ aberto, titulo, mensagem, onOpenChange }: AlertaErroProps) => (
    <div data-testid="alerta-erro" data-aberto={String(aberto)}>
      <span data-testid="alerta-titulo">{titulo}</span>

      <span data-testid="alerta-mensagem">{mensagem}</span>

      <button type="button" onClick={() => onOpenChange(false)}>
        Fechar alerta
      </button>
    </div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ asChild, children, size, variant, ...props }: ButtonProps) => {
    void size;
    void variant;

    if (asChild) {
      return <>{children}</>;
    }

    return <button {...props}>{children}</button>;
  },
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),

  CardTitle: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <div className={className} data-testid="card-title">
      {children}
    </div>
  ),
}));

import CadastrarCargoPage from "../page";

function obterOpcoesMutation(): MutationOptions {
  const chamada = mutateMock.mock.calls.at(-1);

  if (!chamada) {
    throw new Error("A mutation não foi chamada.");
  }

  return chamada[1] as MutationOptions;
}

function enviarFormulario(): void {
  const botao = screen.getByRole("button", {
    name: "Cadastrar cargo",
  });

  const formulario = botao.closest("form");

  if (!formulario) {
    throw new Error("Formulário não encontrado.");
  }

  fireEvent.submit(formulario);
}

describe("CadastrarCargoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    dadosFormulario = {
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "Certificado NR-10",
      documentos: [
        {
          nome: "RG",
        },
      ],
    };

    formularioValido = true;
    formularioEnviando = false;
    mutationPendente = false;

    zodResolverMock.mockReturnValue("resolver-mock");

    useFormMock.mockImplementation(() => ({
      handleSubmit:
        (onSubmit: (dados: DadosFormulario) => void) =>
        (event?: FormEvent<HTMLFormElement>) => {
          event?.preventDefault();
          onSubmit(dadosFormulario);
        },

      formState: {
        isValid: formularioValido,
        isSubmitting: formularioEnviando,
      },
    }));

    useCriarCargoMock.mockImplementation(() => ({
      mutate: mutateMock,
      isPending: mutationPendente,
    }));
  });

  it("configura e renderiza a página de cadastro", () => {
    render(<CadastrarCargoPage />);

    expect(zodResolverMock).toHaveBeenCalledOnce();

    expect(useFormMock).toHaveBeenCalledWith({
      resolver: "resolver-mock",
      mode: "onChange",
      defaultValues: {
        nome: "",
        exige_documento: undefined,
        novo_documento: "",
        documentos: [],
      },
    });

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Cadastro de Cargo",
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("cadastro-breadcrumb")).toBeInTheDocument();

    expect(screen.getByTestId("form-provider")).toBeInTheDocument();

    expect(screen.getByTestId("form-cargo")).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cancelar",
      }),
    ).toHaveAttribute("href", "/cargos");

    expect(
      screen.getByRole("button", {
        name: "Cadastrar cargo",
      }),
    ).toBeEnabled();
  });

  it("inclui o novo documento no payload", () => {
    render(<CadastrarCargoPage />);

    enviarFormulario();

    expect(mutateMock).toHaveBeenCalledOnce();

    expect(mutateMock).toHaveBeenCalledWith(
      {
        nome: "Eletricista",
        exige_documento: "true",
        documentos: [
          {
            nome: "RG",
          },
          {
            nome: "Certificado NR-10",
          },
        ],
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("normaliza o novo documento antes do envio", () => {
    dadosFormulario.novo_documento = "  Certificado NR-10  ";

    render(<CadastrarCargoPage />);

    enviarFormulario();

    expect(mutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        documentos: [
          {
            nome: "RG",
          },
          {
            nome: "Certificado NR-10",
          },
        ],
      }),
      expect.any(Object),
    );
  });

  it("ignora o novo documento vazio", () => {
    dadosFormulario.novo_documento = "   ";

    render(<CadastrarCargoPage />);

    enviarFormulario();

    expect(mutateMock).toHaveBeenCalledWith(
      {
        nome: "Eletricista",
        exige_documento: "true",
        documentos: [
          {
            nome: "RG",
          },
        ],
      },
      expect.any(Object),
    );
  });

  it("usa lista vazia quando documentos não foi informado", () => {
    dadosFormulario.documentos = undefined;
    dadosFormulario.novo_documento = "CPF";

    render(<CadastrarCargoPage />);

    enviarFormulario();

    expect(mutateMock).toHaveBeenCalledWith(
      {
        nome: "Eletricista",
        exige_documento: "true",
        documentos: [
          {
            nome: "CPF",
          },
        ],
      },
      expect.any(Object),
    );
  });

  it("exibe toast quando o cargo é criado com sucesso", () => {
    render(<CadastrarCargoPage />);

    enviarFormulario();

    act(() => {
      obterOpcoesMutation().onSuccess({
        success: true,
        cargo: {
          id: 1,
          nome: "Eletricista",
        },
      });
    });

    expect(toastSucessoMock).toHaveBeenCalledWith({
      titulo: "Sucesso!",
      descricao: "O cargo foi cadastrado.",
    });

    expect(toastErroMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("abre o alerta quando retorna status 400", () => {
    render(<CadastrarCargoPage />);

    enviarFormulario();

    act(() => {
      obterOpcoesMutation().onSuccess({
        success: false,
        error: "api-error",
        title: "Cargo já cadastrado",
        message: "Já existe um cargo com o nome Eletricista cadastrado.",
        status: 400,
      });
    });

    expect(screen.getByTestId("alerta-erro")).toHaveAttribute(
      "data-aberto",
      "true",
    );

    expect(screen.getByTestId("alerta-titulo")).toHaveTextContent(
      "Cargo já cadastrado",
    );

    expect(screen.getByTestId("alerta-mensagem")).toHaveTextContent(
      "Já existe um cargo com o nome Eletricista cadastrado.",
    );

    expect(toastErroMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("fecha o alerta de erro", () => {
    render(<CadastrarCargoPage />);

    enviarFormulario();

    act(() => {
      obterOpcoesMutation().onSuccess({
        success: false,
        error: "api-error",
        title: "Dados inválidos",
        message: "Não foi possível cadastrar o cargo.",
        status: 400,
      });
    });

    expect(screen.getByTestId("alerta-erro")).toHaveAttribute(
      "data-aberto",
      "true",
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fechar alerta",
      }),
    );

    expect(screen.getByTestId("alerta-erro")).toHaveAttribute(
      "data-aberto",
      "false",
    );
  });

  it("exibe toast e redireciona no status 500", () => {
    render(<CadastrarCargoPage />);

    enviarFormulario();

    act(() => {
      obterOpcoesMutation().onSuccess({
        success: false,
        error: "api-error",
        title: "Erro interno",
        message: "Não foi possível cadastrar o cargo.",
        status: 500,
      });
    });

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Erro interno",
      descricao: "Não foi possível cadastrar o cargo.",
    });

    expect(replaceMock).toHaveBeenCalledWith("/cargos");
  });

  it("exibe toast sem redirecionar para outro status", () => {
    render(<CadastrarCargoPage />);

    enviarFormulario();

    act(() => {
      obterOpcoesMutation().onSuccess({
        success: false,
        error: "api-error",
        title: "Conflito",
        message: "O cargo não pôde ser cadastrado.",
        status: 409,
      });
    });

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Conflito",
      descricao: "O cargo não pôde ser cadastrado.",
    });

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("utiliza valores padrão no toast de erro", () => {
    render(<CadastrarCargoPage />);

    enviarFormulario();

    act(() => {
      obterOpcoesMutation().onSuccess({
        success: false,
        error: "api-error",
        title: undefined,
        message: undefined,
        status: 503,
      });
    });

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Erro",
      descricao:
        "Não conseguimos cadastrar o cargo. Por favor, tente novamente.",
    });

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("trata erro inesperado da mutation", () => {
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(<CadastrarCargoPage />);

    enviarFormulario();

    const error = new Error("Falha inesperada");

    act(() => {
      obterOpcoesMutation().onError(error);
    });

    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Erro inesperado ao cadastrar cargo:",
      error,
    );

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Erro",
      descricao:
        "Não conseguimos cadastrar o cargo. Por favor, tente novamente.",
    });

    consoleErrorMock.mockRestore();
  });

  it("desabilita o botão quando o formulário é inválido", () => {
    formularioValido = false;

    render(<CadastrarCargoPage />);

    expect(
      screen.getByRole("button", {
        name: "Cadastrar cargo",
      }),
    ).toBeDisabled();
  });

  it("desabilita o botão durante o envio do formulário", () => {
    formularioValido = true;
    formularioEnviando = true;

    render(<CadastrarCargoPage />);

    expect(
      screen.getByRole("button", {
        name: "Cadastrar cargo",
      }),
    ).toBeDisabled();
  });

  it("desabilita o botão durante a mutation", () => {
    formularioValido = true;
    formularioEnviando = false;
    mutationPendente = true;

    render(<CadastrarCargoPage />);

    expect(
      screen.getByRole("button", {
        name: "Cadastrar cargo",
      }),
    ).toBeDisabled();
  });
});
