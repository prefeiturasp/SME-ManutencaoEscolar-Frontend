import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTodosCargosEol } from "@/features/cargo_eol/hooks/useCargoEol";
import { ContatosUnidadeEducacional } from "@/features/unidade_educacional/components/form/ContatosUnidadeEducacional";
import type { UnidadeEducacionalSchema } from "@/features/unidade_educacional/schemas/unidadesEducacionais.schema";

vi.mock("@/features/cargo_eol/hooks/useCargoEol", () => ({
  useTodosCargosEol: vi.fn(),
}));

const mockUseTodosCargosEol = vi.mocked(useTodosCargosEol);

const RESPONSAVEL_VAZIO = {
  registro_funcional: "",
  nome: "",
  cargo: "",
  email: "",
  telefone: "",
  celular: "",
};

function Wrapper({
  defaultValues = {
    responsaveis: [RESPONSAVEL_VAZIO],
  },
}: {
  defaultValues?: Partial<UnidadeEducacionalSchema>;
}) {
  const methods = useForm<UnidadeEducacionalSchema>({
    defaultValues: defaultValues as UnidadeEducacionalSchema,
  });

  return (
    <FormProvider {...methods}>
      <ContatosUnidadeEducacional />
    </FormProvider>
  );
}

function renderContatos(
  defaultValues?: Partial<UnidadeEducacionalSchema>,
) {
  return render(
    <Wrapper defaultValues={defaultValues} />,
  );
}

describe("ContatosUnidadeEducacional", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseTodosCargosEol.mockReturnValue({
      data: [
        {
          id: 1,
          codigo: "DIRETOR",
          nome: "Diretor",
          perfil: "UE",
          ativo: true,
        },
        {
          id: 2,
          codigo: "COORDENADOR",
          nome: "Coordenador",
          perfil: "UE",
          ativo: true,
        },
      ],
    } as ReturnType<typeof useTodosCargosEol>);
  });

  it("deve renderizar as informações do contato", () => {
    renderContatos();

    expect(
      screen.getByRole("heading", {
        name: "Informações dos contatos responsáveis",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("RF ou CPF"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Nome completo"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Cargo"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("E-mail"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Telefone"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Celular"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Adicionar novo contato",
      }),
    ).toBeInTheDocument();
  });

  it("deve carregar os cargos disponíveis", async () => {
    const user = userEvent.setup();

    renderContatos();

    await user.click(screen.getByLabelText("Cargo"));

    expect(
      screen.getByRole("option", {
        name: "Diretor",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Coordenador",
      }),
    ).toBeInTheDocument();
  });

  it("deve adicionar um novo contato", async () => {
    const user = userEvent.setup();

    renderContatos();

    expect(
      screen.getByText("Contato 1"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Adicionar novo contato",
      }),
    );

    expect(
      screen.getByText("Contato 1"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Contato 2"),
    ).toBeInTheDocument();
  });

  it("não deve permitir remover o único contato", () => {
    renderContatos();

    expect(
      screen.getByRole("button", {
        name: "Remover contato",
      }),
    ).toBeDisabled();
  });

  it("deve permitir remover um contato novo", async () => {
    const user = userEvent.setup();

    renderContatos({
    responsaveis: [
      {
        registro_funcional: "1234567",
        nome: "João da Silva",
        cargo: "DIRETOR",
        email: "joao@example.com",
        telefone: "1133334444",
        celular: "11999998888",
        responsavelExistente: true,
      },
    ],
  });

    await user.click(
      screen.getByRole("button", {
        name: "Adicionar novo contato",
      }),
    );

    const botoesRemover = screen.getAllByRole("button", {
      name: "Remover contato",
    });

    expect(botoesRemover).toHaveLength(2);

    expect(botoesRemover[0]).toBeDisabled();
    expect(botoesRemover[1]).not.toBeDisabled();

    await user.click(botoesRemover[1]);

    expect(
      screen.queryByText("Contato 2"),
    ).not.toBeInTheDocument();
  });
});