import { fireEvent, render, screen } from "@testing-library/react";

import type { FormEvent, ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { EditarCargoForm } from "@/features/cargo/components/EditarCargoForm";

import type { Cargo } from "@/features/cargo/types/cargos.types";

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
  editarCargo: vi.fn(),
  useEditarCargo: vi.fn(),
  tratarResultado: vi.fn(),
  tratarErroInesperado: vi.fn(),
  useFeedbackEntidade: vi.fn(),
  onOpenChange: vi.fn(),
  useForm: vi.fn(),
  zodResolver: vi.fn(),
  formatarDataHora: vi.fn(),
  resolver: vi.fn(),

  dadosFormulario: {
    nome: "Engenheiro Eletricista atualizado",
    exige_documento: "true",
    novo_documento: "Certificado NR-35",
    documentos: [
      {
        nome: "Certificado NR-10",
      },
    ],
  } as DadosFormulario,

  formState: {
    isValid: true,
    isDirty: true,
  },

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
        isDirty: mocks.formState.isDirty,
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

vi.mock("@/features/cargo/hooks/useEditarCargo", () => ({
  useEditarCargo: (uuid: string) => {
    mocks.useEditarCargo(uuid);

    return {
      mutate: mocks.editarCargo,
    };
  },
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
        mensagem: "Já existe outro cargo com o nome informado.",
        onOpenChange: mocks.onOpenChange,
      },
    };
  },
}));

vi.mock("@/utils/formatadores", () => ({
  formatarDataHora: (data: string) => {
    mocks.formatarDataHora(data);

    return `Formatado: ${data}`;
  },
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

const cargoBase = {
  id: 1,
  uuid: "a6421bd7-a6e5-4883-a7c7-43cff161618a",
  nome: "Engenheiro Eletricista",
  exige_documento: true,
  status: true,
  documentos: [
    {
      nome: "Certificado NR-10",
    },
  ],
  criado_por: 1,
  criado_por_nome: "Administrador",
  criado_em: "2026-09-17T18:00:00-03:00",
  atualizado_por: 2,
  atualizado_por_nome: "Editor",
  username: "usuario.teste",
  atualizado_em: "2026-09-18T19:30:00-03:00",
} as Cargo;

function obterFormulario(): HTMLFormElement {
  const botao = screen.getByRole("button", {
    name: "Salvar",
  });

  const formulario = botao.closest("form");

  if (!(formulario instanceof HTMLFormElement)) {
    throw new Error("Formulário de edição não encontrado.");
  }

  return formulario;
}

describe("EditarCargoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.formState.isValid = true;
    mocks.formState.isDirty = true;
    mocks.alertaAberto = false;

    mocks.dadosFormulario = {
      nome: "Engenheiro Eletricista atualizado",
      exige_documento: "true",
      novo_documento: "Certificado NR-35",
      documentos: [
        {
          nome: "Certificado NR-10",
        },
      ],
    };
  });

  it("renderiza o formulário de edição", () => {
    render(<EditarCargoForm uuid={cargoBase.uuid ?? ""} cargo={cargoBase} />);

    expect(
      screen.getByRole("heading", {
        name: "Editar Cargo",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cancelar",
      }),
    ).toHaveAttribute("href", "/cargos");

    expect(screen.getByTestId("form-cargo")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Preencha as informações e clique em “salvar” para armazenar os dados.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Salvar",
      }),
    ).toBeEnabled();
  });

  it("configura o hook de edição com o UUID", () => {
    render(<EditarCargoForm uuid="uuid-cargo-123" cargo={cargoBase} />);

    expect(mocks.useEditarCargo).toHaveBeenCalledExactlyOnceWith(
      "uuid-cargo-123",
    );
  });

  it("configura o feedback da edição", () => {
    render(<EditarCargoForm uuid={cargoBase.uuid ?? ""} cargo={cargoBase} />);

    expect(mocks.useFeedbackEntidade).toHaveBeenCalledExactlyOnceWith({
      mensagemSucesso: "As alterações do cargo foram salvas.",
      contextoErro: "editar cargo",
      rotaRetorno: "/cargos",
    });
  });

  it("configura os valores iniciais quando exige documento", () => {
    render(<EditarCargoForm uuid={cargoBase.uuid ?? ""} cargo={cargoBase} />);

    expect(mocks.zodResolver).toHaveBeenCalledOnce();

    expect(mocks.useForm).toHaveBeenCalledExactlyOnceWith({
      resolver: mocks.resolver,
      mode: "onChange",
      defaultValues: {
        nome: "Engenheiro Eletricista",
        exige_documento: "true",
        novo_documento: "",
        documentos: [
          {
            nome: "Certificado NR-10",
          },
        ],
      },
    });
  });

  it("converte exige_documento false para a string false", () => {
    const cargo = {
      ...cargoBase,
      exige_documento: false,
    };

    render(<EditarCargoForm uuid={cargo.uuid ?? ""} cargo={cargo} />);

    expect(mocks.useForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: expect.objectContaining({
          exige_documento: "false",
        }),
      }),
    );
  });

  it("mantém exige_documento indefinido quando não existe valor", () => {
    const cargo = {
      ...cargoBase,
      nome: undefined,
      exige_documento: undefined,
    } as unknown as Cargo;

    render(<EditarCargoForm uuid={cargo.uuid ?? ""} cargo={cargo} />);

    expect(mocks.useForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: expect.objectContaining({
          nome: "",
          exige_documento: undefined,
        }),
      }),
    );
  });

  it("envia os documentos existentes e o novo documento", () => {
    render(<EditarCargoForm uuid={cargoBase.uuid ?? ""} cargo={cargoBase} />);

    fireEvent.submit(obterFormulario());

    expect(mocks.editarCargo).toHaveBeenCalledExactlyOnceWith(
      {
        nome: "Engenheiro Eletricista atualizado",
        exige_documento: "true",
        documentos: [
          {
            nome: "Certificado NR-10",
          },
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

  it("remove os espaços do novo documento", () => {
    mocks.dadosFormulario = {
      nome: "Engenheiro Eletricista",
      exige_documento: "true",
      novo_documento: "   Certificado NR-12   ",
      documentos: [],
    };

    render(<EditarCargoForm uuid={cargoBase.uuid ?? ""} cargo={cargoBase} />);

    fireEvent.submit(obterFormulario());

    expect(mocks.editarCargo).toHaveBeenCalledWith(
      {
        nome: "Engenheiro Eletricista",
        exige_documento: "true",
        documentos: [
          {
            nome: "Certificado NR-12",
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
      nome: "Engenheiro Eletricista",
      exige_documento: "true",
      novo_documento: "   ",
      documentos: [
        {
          nome: "Certificado NR-10",
        },
      ],
    };

    render(<EditarCargoForm uuid={cargoBase.uuid ?? ""} cargo={cargoBase} />);

    fireEvent.submit(obterFormulario());

    expect(mocks.editarCargo).toHaveBeenCalledWith(
      {
        nome: "Engenheiro Eletricista",
        exige_documento: "true",
        documentos: [
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

  it("envia uma lista vazia quando não existem documentos", () => {
    mocks.dadosFormulario = {
      nome: "Auxiliar Administrativo",
      exige_documento: "false",
      novo_documento: undefined,
      documentos: undefined,
    };

    render(<EditarCargoForm uuid={cargoBase.uuid ?? ""} cargo={cargoBase} />);

    fireEvent.submit(obterFormulario());

    expect(mocks.editarCargo).toHaveBeenCalledWith(
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

  it("exibe os dados de auditoria formatados", () => {
    render(<EditarCargoForm uuid={cargoBase.uuid ?? ""} cargo={cargoBase} />);

    expect(mocks.formatarDataHora).toHaveBeenNthCalledWith(
      1,
      cargoBase.criado_em,
    );

    expect(mocks.formatarDataHora).toHaveBeenNthCalledWith(
      2,
      cargoBase.atualizado_em,
    );

    expect(
      screen.getByText(/INSERIDO por Administrador \(usuario\.teste\)/),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/ALTERADO por Editor \(usuario\.teste\)/),
    ).toBeInTheDocument();

    expect(
      screen.getByText(`Formatado: ${cargoBase.criado_em}`, {
        exact: false,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(`Formatado: ${cargoBase.atualizado_em}`, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("exibe não informado quando os responsáveis não existem", () => {
    const cargo = {
      ...cargoBase,
      criado_por_nome: null,
      atualizado_por_nome: null,
    };

    render(<EditarCargoForm uuid={cargo.uuid ?? ""} cargo={cargo} />);

    expect(
      screen.getAllByText(/Não informado \(usuario\.teste\)/),
    ).toHaveLength(2);
  });

  it("exibe o alerta de erro", () => {
    mocks.alertaAberto = true;

    render(<EditarCargoForm uuid={cargoBase.uuid ?? ""} cargo={cargoBase} />);

    expect(screen.getByTestId("alerta-aberto")).toHaveTextContent("true");

    expect(screen.getByText("Cargo já cadastrado")).toBeInTheDocument();

    expect(
      screen.getByText("Já existe outro cargo com o nome informado."),
    ).toBeInTheDocument();
  });

  it("fecha o alerta de erro", () => {
    mocks.alertaAberto = true;

    render(<EditarCargoForm uuid={cargoBase.uuid ?? ""} cargo={cargoBase} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fechar alerta",
      }),
    );

    expect(mocks.onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it.each([
    {
      descricao: "o formulário é inválido",
      isValid: false,
      isDirty: true,
    },
    {
      descricao: "o formulário não possui alterações",
      isValid: true,
      isDirty: false,
    },
  ])("desabilita o botão quando $descricao", ({ isValid, isDirty }) => {
    mocks.formState.isValid = isValid;
    mocks.formState.isDirty = isDirty;

    render(<EditarCargoForm uuid={cargoBase.uuid ?? ""} cargo={cargoBase} />);

    expect(
      screen.getByRole("button", {
        name: "Salvar",
      }),
    ).toBeDisabled();
  });

  it("habilita o botão quando o formulário é válido e foi alterado", () => {
    mocks.formState.isValid = true;
    mocks.formState.isDirty = true;

    render(<EditarCargoForm uuid={cargoBase.uuid ?? ""} cargo={cargoBase} />);

    expect(
      screen.getByRole("button", {
        name: "Salvar",
      }),
    ).toBeEnabled();
  });
});
