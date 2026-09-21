import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTodosCargosEol } from "@/features/cargo_eol/hooks/useCargoEol";
import { ContatosUnidadeEducacional } from "@/features/unidade_educacional/components/form/ContatosUnidadeEducacional";
import type { UnidadeEducacionalOutput, UnidadeEducacionalSchema } from "@/features/unidade_educacional/schemas/unidadesEducacionais.schema";
import { unidadeEducacionalSchema } from "@/features/unidade_educacional/schemas/unidadesEducacionais.schema";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const methods = useForm<UnidadeEducacionalSchema,unknown, UnidadeEducacionalOutput>({
     resolver: zodResolver(unidadeEducacionalSchema),
     defaultValues: defaultValues as UnidadeEducacionalSchema,
      mode: "onBlur",
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

const RESPONSAVEL_VALIDO = {
  registro_funcional: "1234567",
  nome: "João da Silva",
  cargo: "DIRETOR",
  email: "joao@example.com",
  telefone: "",
  celular: "",
};

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

  it("não deve permitir remover um contato existente", () => {
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

  expect(
    screen.getByRole("button", {
      name: "Remover contato",
    }),
  ).toBeDisabled();
});
it("deve permitir remover o contato novo mantendo o contato existente", async () => {
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

  expect(botoesRemover[0]).toBeDisabled();
  expect(botoesRemover[1]).not.toBeDisabled();

  await user.click(botoesRemover[1]);

  expect(screen.getByText("Contato 1")).toBeInTheDocument();
  expect(screen.queryByText("Contato 2")).not.toBeInTheDocument();
});
it("deve preencher os campos com os dados do contato", () => {
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

  expect(
    screen.getByLabelText("RF ou CPF"),
  ).toHaveValue("1234567");

  expect(
    screen.getByLabelText("Nome completo"),
  ).toHaveValue("João da Silva");

  expect(
    screen.getByLabelText("E-mail"),
  ).toHaveValue("joao@example.com");

  expect(
    screen.getByLabelText("Telefone"),
  ).toHaveValue("(11) 3333-4444");

  expect(
    screen.getByLabelText("Celular"),
  ).toHaveValue("(11) 99999-8888");
});
it("deve exibir o cargo selecionado do contato", async () => {
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

  expect(
    screen.getByText("Diretor"),
  ).toBeInTheDocument();

  await user.click(screen.getByLabelText("Cargo"));

  expect(
    screen.getByRole("option", {
      name: "Diretor",
    }),
  ).toBeInTheDocument();
});
it("deve exibir erro quando RF ou CPF não for preenchido", async () => {
  const user = userEvent.setup();

  renderContatos();

  await user.click(
    screen.getByRole("button", {
      name: "Adicionar novo contato",
    }),
  );

  const botoesRemover = screen.getAllByRole("button", {
    name: "Remover contato",
  });

  await user.click(botoesRemover[1]);

  const campo = screen.getByLabelText("RF ou CPF");

  await user.click(campo);
  await user.tab();

  expect(
    await screen.findByText("RF ou CPF é obrigatório!"),
  ).toBeInTheDocument();
});

it.each([
  [
    "RF ou CPF com caracteres não numéricos",
    "123abc",
    "RF ou CPF deve conter apenas números!",
  ],
  [
    "RF com quantidade inválida de dígitos",
    "123456",
    "RF deve conter 7 dígitos ou CPF deve conter 11 dígitos!",
  ],
  [
    "CPF com quantidade inválida de dígitos",
    "1234567890",
    "RF deve conter 7 dígitos ou CPF deve conter 11 dígitos!",
  ],
])(
  "deve exibir erro quando houver %s",
  async (_descricao, registroFuncional, mensagemErro) => {
    const user = userEvent.setup();

    renderContatos({
      responsaveis: [
        {
          ...RESPONSAVEL_VALIDO,
          registro_funcional: registroFuncional,
        },
      ],
    });

    const campo = screen.getByLabelText("RF ou CPF");

    await user.click(campo);
    await user.tab();

    expect(
      await screen.findByText(mensagemErro),
    ).toBeInTheDocument();
  },
);

it("deve aceitar RF com 7 dígitos", async () => {
  const user = userEvent.setup();

  renderContatos();

  const campo = screen.getByLabelText("RF ou CPF");

  await user.type(campo, "1234567");

  await user.tab();

  expect(
    screen.queryByText(
      "RF deve conter 7 dígitos ou CPF deve conter 11 dígitos!",
    ),
  ).not.toBeInTheDocument();
});
it("deve aceitar CPF com 11 dígitos", async () => {
  const user = userEvent.setup();

  renderContatos();

  const campo = screen.getByLabelText("RF ou CPF");

  await user.type(campo, "12345678901");

  await user.tab();

  expect(
    screen.queryByText(
      "RF deve conter 7 dígitos ou CPF deve conter 11 dígitos!",
    ),
  ).not.toBeInTheDocument();
});
it("deve exibir erro quando nome não for preenchido", async () => {
  const user = userEvent.setup();

  renderContatos({
    responsaveis: [
      {
        ...RESPONSAVEL_VALIDO,
        nome: "",
      },
    ],
  });

  const campo = screen.getByLabelText("Nome completo");

  await user.click(campo);
  await user.tab();

  expect(campo).toHaveAttribute("aria-invalid", "true");
});

it("deve invalidar o campo cargo quando não for preenchido", async () => {
const user = userEvent.setup();

  renderContatos({
    responsaveis: [{ ...RESPONSAVEL_VALIDO, cargo: "" }],
  });

  const campo = screen.getByLabelText("Cargo");

  await user.click(campo);
  expect(screen.getByRole("option", { name: "Diretor" })).toBeInTheDocument();

  await user.click(campo);

  expect(campo).toHaveAttribute("aria-invalid", "true");

    expect(
    await screen.findByText("Cargo é obrigatório!"),
  ).toBeInTheDocument();
});
it("deve exibir erro quando e-mail não for preenchido", async () => {
  const user = userEvent.setup();

  renderContatos({
    responsaveis: [
      {
        ...RESPONSAVEL_VALIDO,
        email: "",
      },
    ],
  });

  const campo = screen.getByLabelText("E-mail");

  await user.click(campo);
  await user.tab();

  expect(
    await screen.findByText("E-mail é obrigatório!"),
  ).toBeInTheDocument();
});
it.each([
  "email-invalido",
  "email@",
  "@email.com",
])(
  "deve exibir erro quando e-mail for inválido: %s",
  async (email) => {
    const user = userEvent.setup();

    renderContatos({
      responsaveis: [
        {
          ...RESPONSAVEL_VALIDO,
          email,
        },
      ],
    });

    const campo = screen.getByLabelText("E-mail");

    await user.click(campo);
    await user.tab();

    expect(
      await screen.findByText("E-mail inválido!"),
    ).toBeInTheDocument();
  },
);
});