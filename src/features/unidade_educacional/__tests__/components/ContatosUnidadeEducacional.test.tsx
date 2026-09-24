import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContatosUnidadeEducacional } from "@/features/unidade_educacional/components/form/ContatosUnidadeEducacional";
import type { UnidadeEducacionalSchema } from "@/features/unidade_educacional/schemas/unidadesEducacionais.schema";

const mockUseTodosCargosEol = vi.fn();

vi.mock("@/features/cargo_eol/hooks/useCargoEol", () => ({
  useTodosCargosEol: () => mockUseTodosCargosEol(),
}));

vi.mock("@/components/form", async () => {
  const ReactHookForm = await import("react-hook-form");

  return {
    FormTextField: ({
      name,
      label,
      placeholder,
      disabled,
    }: {
      name: string;
      label: string;
      placeholder?: string;
      disabled?: boolean;
    }) => {
      const { field } = ReactHookForm.useController({ name });

      return (
        <div>
          <label htmlFor={name}>{label}</label>
          <input
            id={name}
            {...field}
            placeholder={placeholder}
            disabled={disabled}
          />
        </div>
      );
    },

    FormMaskedField: ({
      name,
      label,
      placeholder,
    }: {
      name: string;
      label: string;
      placeholder?: string;
    }) => {
      const { field } = ReactHookForm.useController({ name });

      return (
        <div>
          <label htmlFor={name}>{label}</label>
          <input
            id={name}
            {...field}
            placeholder={placeholder}
          />
        </div>
      );
    },
  };
});

vi.mock("@/components/form/FormComboboxField", async () => {
  const ReactHookForm = await import("react-hook-form");

  return {
    FormComboboxField: ({
      name,
      label,
      options,
      placeholder,
      disabled,
    }: {
      name: string;
      label: string;
      options: Array<{ value: string; label: string }>;
      placeholder?: string;
      disabled?: boolean;
    }) => {
      const { field } = ReactHookForm.useController({ name });

      return (
        <div>
          <label htmlFor={name}>{label}</label>

          <select
            id={name}
            {...field}
            disabled={disabled}
          >
            <option value="">{placeholder}</option>

            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    },
  };
});

vi.mock("@/components/icons/plus", () => ({
  PlusIcon: () => <span data-testid="plus-icon" />,
}));

vi.mock("lucide-react", () => ({
  Trash2: () => <span data-testid="trash-icon" />,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,

  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
  }) => (
    <button type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));


const contato = {
  uuid: "uuid-1",
  registro_funcional: "1234567",
  nome: "João da Silva",
  cargo: "DIRETOR",
  email: "joao@example.com",
  telefone: "1133334444",
  celular: "11999998888",
  criado_pelo_sincronizador: false,
};

type TestProps = {
  responsaveis: UnidadeEducacionalSchema["responsaveis"];
};

function TestWrapper({ responsaveis }: TestProps) {
  const form = useForm<UnidadeEducacionalSchema>({
    defaultValues: {
      responsaveis,
    },
  });

  return (
    <FormProvider {...form}>
      <ContatosUnidadeEducacional data-testid="contatos-responsaveis" />
    </FormProvider>
  );
}

function renderComponente(responsaveis: UnidadeEducacionalSchema["responsaveis"] = [contato]) {
  return render(<TestWrapper responsaveis={responsaveis} />);
}

describe("ContatosUnidadeEducacional", () => {
  beforeEach(() => {
    mockUseTodosCargosEol.mockReturnValue({
      data: [
        {
          codigo: "DIRETOR",
          nome: "Diretor",
        },
        {
          codigo: "COORDENADOR",
          nome: "Coordenador",
        },
      ],
    });
  });

  it("deve renderizar o título e a descrição", () => {
    renderComponente();

    expect(
      screen.getByRole("heading", {
        name: "Informações dos contatos responsáveis",
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Dados de identificação de uma ou mais pessoas responsáveis pela Unidade Educacional.",
      ),
    ).toBeInTheDocument();
  });

  it("deve renderizar o data-testid informado", () => {
    renderComponente();

    expect(screen.getByTestId("contatos-responsaveis")).toBeInTheDocument();
  });

  it("deve renderizar os dados do contato", () => {
    renderComponente();

    expect(screen.getByLabelText("RF ou CPF")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
    expect(screen.getByLabelText("Cargo")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Telefone")).toBeInTheDocument();
    expect(screen.getByLabelText("Celular")).toBeInTheDocument();

    expect(screen.getByDisplayValue("1234567")).toBeInTheDocument();
    expect(screen.getByDisplayValue("João da Silva")).toBeInTheDocument();
    expect(screen.getByDisplayValue("joao@example.com")).toBeInTheDocument();
  });

  it("deve renderizar os cargos recebidos", () => {
    renderComponente();

    expect(screen.getByRole("option", { name: "Diretor" })).toHaveValue("DIRETOR");

    expect(screen.getByRole("option", { name: "Coordenador" })).toHaveValue("COORDENADOR");
  });

  it("deve renderizar sem opções quando não houver cargos", () => {
    mockUseTodosCargosEol.mockReturnValue({
      data: undefined,
    });

    renderComponente();

    expect(
      screen.getByRole("option", {
        name: "Selecione o cargo",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("option", {
        name: "Diretor",
      }),
    ).not.toBeInTheDocument();
  });

  it("deve habilitar RF, nome e cargo para contato não sincronizado", () => {
    renderComponente([
      {
        ...contato,
        criado_pelo_sincronizador: false,
      },
    ]);

    expect(screen.getByLabelText("RF ou CPF")).not.toBeDisabled();
    expect(screen.getByLabelText("Nome completo")).not.toBeDisabled();
    expect(screen.getByLabelText("Cargo")).not.toBeDisabled();
  });

  it("deve desabilitar RF, nome e cargo para contato sincronizado", () => {
    renderComponente([
      {
        ...contato,
        criado_pelo_sincronizador: true,
      },
    ]);

    expect(screen.getByLabelText("RF ou CPF")).toBeDisabled();
    expect(screen.getByLabelText("Nome completo")).toBeDisabled();
    expect(screen.getByLabelText("Cargo")).toBeDisabled();
  });

  it("deve manter email, telefone e celular habilitados para contato sincronizado", () => {
    renderComponente([
      {
        ...contato,
        criado_pelo_sincronizador: true,
      },
    ]);

    expect(screen.getByLabelText("E-mail")).not.toBeDisabled();
    expect(screen.getByLabelText("Telefone")).not.toBeDisabled();
    expect(screen.getByLabelText("Celular")).not.toBeDisabled();
  });

  it("deve desabilitar o botão de remover quando houver apenas um contato sincronizado", () => {
    renderComponente([
      {
        ...contato,
        criado_pelo_sincronizador: true,
      },
    ]);

    expect(
      screen.getByRole("button", {
        name: "Remover contato",
      }),
    ).toBeDisabled();
  });

  it("deve limpar o primeiro contato ao removê-lo", () => {
    renderComponente([contato]);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remover contato",
      }),
    );

    expect(screen.getByLabelText("RF ou CPF")).toHaveValue("");

    expect(screen.getByLabelText("Nome completo")).toHaveValue("");

    expect(screen.getByLabelText("Cargo")).toHaveValue("");

    expect(screen.getByLabelText("E-mail")).toHaveValue("");
  });

  it("deve remover o segundo contato", () => {
    const segundoContato = {
      ...contato,
      uuid: "uuid-2",
      registro_funcional: "7654321",
      nome: "Maria Silva",
      cargo: "COORDENADOR",
      email: "maria@example.com",
    };

    renderComponente([contato, segundoContato]);

    expect(
      screen.getByRole("heading", {
        name: "Contato 1",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Contato 2",
      }),
    ).toBeInTheDocument();

    const botoesRemover = screen.getAllByRole("button", {
      name: "Remover contato",
    });

    fireEvent.click(botoesRemover[1]);

    expect(
      screen.getByRole("heading", {
        name: "Contato 1",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Contato 2",
      }),
    ).not.toBeInTheDocument();

    expect(screen.getByDisplayValue("João da Silva")).toBeInTheDocument();

    expect(screen.queryByDisplayValue("Maria Silva")).not.toBeInTheDocument();
  });

  it("deve adicionar um novo contato", () => {
    renderComponente();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Adicionar novo contato",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Contato 2",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar múltiplos contatos", () => {
    const segundoContato = {
      ...contato,
      uuid: "uuid-2",
      registro_funcional: "7654321",
      nome: "Maria Silva",
      cargo: "COORDENADOR",
      email: "maria@example.com",
    };

    renderComponente([contato, segundoContato]);

    expect(
      screen.getByRole("heading", {
        name: "Contato 1",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Contato 2",
      }),
    ).toBeInTheDocument();

    expect(screen.getByDisplayValue("João da Silva")).toBeInTheDocument();

    expect(screen.getByDisplayValue("Maria Silva")).toBeInTheDocument();
  });
});
