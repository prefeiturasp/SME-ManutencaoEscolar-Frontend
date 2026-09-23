import { fireEvent, render, screen } from "@testing-library/react";

import type { FormEvent, ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import CadastrarCargoPage from "../page";

type DadosFormulario = {
  nome: string;
  exige_documento?: "true" | "false";
  novo_documento?: string;
  documentos?: Array<{
    nome: string;
  }>;
};

type ConfiguracaoFeedback = {
  mensagemSucesso: string;
  contextoErro: string;
  rotaRetorno: string;
};

const mocks = vi.hoisted(() => ({
  criarCargo: vi.fn(),
  tratarResultado: vi.fn(),
  tratarErroInesperado: vi.fn(),
  onOpenChange: vi.fn(),
  useForm: vi.fn(),
  useFeedbackEntidade: vi.fn(),
  zodResolver: vi.fn(),
  resolver: vi.fn(),

  dadosFormulario: {
    nome: "Engenheiro Eletricista",
    exige_documento: "true",
    novo_documento: "Certificado NR-10",
    documentos: [
      {
        nome: "Documento existente",
      },
    ],
  } as DadosFormulario,

  formState: {
    isValid: true,
    isSubmitting: false,
  },

  isPending: false,
  alertaAberto: false,
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: (schema: unknown) => {
    mocks.zodResolver(schema);

    return mocks.resolver;
  },
}));

vi.mock("@/features/cargo/schemas/cargoSchema", () => ({
  cargoSchema: {
    tipo: "cargo-schema-mock",
  },
}));

vi.mock("react-hook-form", () => ({
  useForm: (configuracao: unknown) => {
    mocks.useForm(configuracao);

    return {
      handleSubmit:
        (callback: (dados: DadosFormulario) => void) =>
        (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          callback(mocks.dadosFormulario);
        },

      formState: {
        isValid: mocks.formState.isValid,
        isSubmitting: mocks.formState.isSubmitting,
      },

      control: {},
      register: vi.fn(),
      setValue: vi.fn(),
      getValues: vi.fn(),
      trigger: vi.fn(),
      watch: vi.fn(),
    };
  },

  FormProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/features/cargo/hooks/useCriarCargo", () => ({
  useCriarCargo: () => ({
    mutate: mocks.criarCargo,
    isPending: mocks.isPending,
  }),
}));

vi.mock("@/hooks/useFeedbackEntidade", () => ({
  useFeedbackEntidade: (configuracao: ConfiguracaoFeedback) => {
    mocks.useFeedbackEntidade(configuracao);

    return {
      tratarResultado: mocks.tratarResultado,
      tratarErroInesperado: mocks.tratarErroInesperado,
      alertaProps: {
        aberto: mocks.alertaAberto,
        titulo: "Cargo já cadastrado",
        mensagem: "Já existe um cargo com o nome informado.",
        onOpenChange: mocks.onOpenChange,
      },
    };
  },
}));

vi.mock("@/app/(cadastro)/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => (
    <nav data-testid="cadastro-breadcrumb">Breadcrumb</nav>
  ),
}));

vi.mock("@/features/cargo/components/FormCargo", () => ({
  FormCargo: () => <div data-testid="form-cargo">Formulário do cargo</div>,
}));

vi.mock("@/components/shared/AlertaErro/AlertaErro", () => ({
  AlertaErro: ({
    aberto,
    titulo,
    mensagem,
    onOpenChange,
  }: {
    aberto: boolean;
    titulo: string;
    mensagem: string;
    onOpenChange: (aberto: boolean) => void;
  }) => (
    <div data-testid="alerta-erro">
      <span data-testid="alerta-aberto">{String(aberto)}</span>

      <h2>{titulo}</h2>

      <p>{mensagem}</p>

      <button
        type="button"
        onClick={() => {
          onOpenChange(false);
        }}
      >
        Fechar alerta
      </button>
    </div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    asChild,
    children,
    disabled,
    type,
  }: {
    asChild?: boolean;
    children: ReactNode;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
  }) => {
    if (asChild) {
      return <>{children}</>;
    }

    return (
      <button type={type} disabled={disabled}>
        {children}
      </button>
    );
  },
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),

  CardTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

function obterFormulario(): HTMLFormElement {
  const botao = screen.getByRole("button", {
    name: "Cadastrar cargo",
  });

  const formulario = botao.closest("form");

  if (!(formulario instanceof HTMLFormElement)) {
    throw new Error("Formulário de cadastro não encontrado.");
  }

  return formulario;
}

describe("CadastrarCargoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.formState.isValid = true;
    mocks.formState.isSubmitting = false;
    mocks.isPending = false;
    mocks.alertaAberto = false;

    mocks.dadosFormulario = {
      nome: "Engenheiro Eletricista",
      exige_documento: "true",
      novo_documento: "Certificado NR-10",
      documentos: [
        {
          nome: "Documento existente",
        },
      ],
    };
  });

  it("renderiza os elementos da página", () => {
    render(<CadastrarCargoPage />);

    expect(screen.getByTestId("cadastro-breadcrumb")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Cadastro de Cargo",
      }),
    ).toBeInTheDocument();

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

    expect(screen.getByTestId("form-cargo")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Preencha as informações e clique em “cadastrar cargo” para armazenar os dados.",
      ),
    ).toBeInTheDocument();

    expect(obterFormulario()).toHaveAttribute("novalidate");
  });

  it("configura o formulário com os valores iniciais", () => {
    render(<CadastrarCargoPage />);

    expect(mocks.zodResolver).toHaveBeenCalledOnce();

    expect(mocks.useForm).toHaveBeenCalledExactlyOnceWith({
      resolver: mocks.resolver,
      mode: "onChange",
      defaultValues: {
        nome: "",
        exige_documento: undefined,
        novo_documento: "",
        documentos: [],
      },
    });
  });

  it("configura o feedback do cadastro", () => {
    render(<CadastrarCargoPage />);

    expect(mocks.useFeedbackEntidade).toHaveBeenCalledExactlyOnceWith({
      mensagemSucesso: "O cargo foi cadastrado.",
      contextoErro: "criar cargo",
      rotaRetorno: "/cargos",
    });
  });

  it("adiciona o novo documento ao payload", () => {
    render(<CadastrarCargoPage />);

    fireEvent.submit(obterFormulario());

    expect(mocks.criarCargo).toHaveBeenCalledExactlyOnceWith(
      {
        nome: "Engenheiro Eletricista",
        exige_documento: "true",
        documentos: [
          {
            nome: "Documento existente",
          },
          {
            nome: "Certificado NR-10",
          },
        ],
      },
      {
        onSuccess: mocks.tratarResultado,
        onError: mocks.tratarErroInesperado,
      },
    );
  });

  it("remove os espaços do novo documento", () => {
    mocks.dadosFormulario = {
      nome: "Engenheiro Eletricista",
      exige_documento: "true",
      novo_documento: "   Certificado NR-35   ",
      documentos: [],
    };

    render(<CadastrarCargoPage />);

    fireEvent.submit(obterFormulario());

    expect(mocks.criarCargo).toHaveBeenCalledWith(
      {
        nome: "Engenheiro Eletricista",
        exige_documento: "true",
        documentos: [
          {
            nome: "Certificado NR-35",
          },
        ],
      },
      {
        onSuccess: mocks.tratarResultado,
        onError: mocks.tratarErroInesperado,
      },
    );
  });

  it("não adiciona documento quando o campo contém somente espaços", () => {
    mocks.dadosFormulario = {
      nome: "Auxiliar Administrativo",
      exige_documento: "false",
      novo_documento: "   ",
      documentos: [
        {
          nome: "Documento existente",
        },
      ],
    };

    render(<CadastrarCargoPage />);

    fireEvent.submit(obterFormulario());

    expect(mocks.criarCargo).toHaveBeenCalledWith(
      {
        nome: "Auxiliar Administrativo",
        exige_documento: "false",
        documentos: [
          {
            nome: "Documento existente",
          },
        ],
      },
      {
        onSuccess: mocks.tratarResultado,
        onError: mocks.tratarErroInesperado,
      },
    );
  });

  it("envia uma lista vazia quando não existem documentos", () => {
    mocks.dadosFormulario = {
      nome: "Auxiliar Administrativo",
      exige_documento: "false",
      novo_documento: "",
      documentos: undefined,
    };

    render(<CadastrarCargoPage />);

    fireEvent.submit(obterFormulario());

    expect(mocks.criarCargo).toHaveBeenCalledWith(
      {
        nome: "Auxiliar Administrativo",
        exige_documento: "false",
        documentos: [],
      },
      {
        onSuccess: mocks.tratarResultado,
        onError: mocks.tratarErroInesperado,
      },
    );
  });

  it("exibe as informações do alerta", () => {
    mocks.alertaAberto = true;

    render(<CadastrarCargoPage />);

    expect(screen.getByTestId("alerta-aberto")).toHaveTextContent("true");

    expect(screen.getByText("Cargo já cadastrado")).toBeInTheDocument();

    expect(
      screen.getByText("Já existe um cargo com o nome informado."),
    ).toBeInTheDocument();
  });

  it("fecha o alerta de erro", () => {
    mocks.alertaAberto = true;

    render(<CadastrarCargoPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fechar alerta",
      }),
    );

    expect(mocks.onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it.each([
    {
      descricao: "formulário inválido",
      isValid: false,
      isSubmitting: false,
      isPending: false,
    },
    {
      descricao: "formulário sendo enviado",
      isValid: true,
      isSubmitting: true,
      isPending: false,
    },
    {
      descricao: "mutation pendente",
      isValid: true,
      isSubmitting: false,
      isPending: true,
    },
  ])(
    "desabilita o botão quando existe $descricao",
    ({ isValid, isSubmitting, isPending }) => {
      mocks.formState.isValid = isValid;
      mocks.formState.isSubmitting = isSubmitting;
      mocks.isPending = isPending;

      render(<CadastrarCargoPage />);

      expect(
        screen.getByRole("button", {
          name: "Cadastrar cargo",
        }),
      ).toBeDisabled();
    },
  );

  it("habilita o botão quando o formulário pode ser enviado", () => {
    mocks.formState.isValid = true;
    mocks.formState.isSubmitting = false;
    mocks.isPending = false;

    render(<CadastrarCargoPage />);

    expect(
      screen.getByRole("button", {
        name: "Cadastrar cargo",
      }),
    ).toBeEnabled();
  });
});
