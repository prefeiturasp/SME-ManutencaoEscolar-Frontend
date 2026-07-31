import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  registerMock,
  clearErrorsMock,
  fieldOnChangeMock,
  fieldOnBlurMock,
  fieldRefMock,
  useFormContextMock,
} = vi.hoisted(() => ({
  registerMock: vi.fn(),
  clearErrorsMock: vi.fn(),
  fieldOnChangeMock: vi.fn(),
  fieldOnBlurMock: vi.fn(),
  fieldRefMock: vi.fn(),
  useFormContextMock: vi.fn(),
}));

vi.mock("react-hook-form", async () => {
  const actual =
    await vi.importActual<typeof import("react-hook-form")>("react-hook-form");

  return {
    ...actual,
    useFormContext: useFormContextMock,
  };
});

import { FormTextField } from "../components/form/FormTextField";

interface TestForm {
  nome: string;
}

function configurarFormulario(errors: Record<string, unknown> = {}) {
  registerMock.mockReturnValue({
    name: "nome",
    onChange: fieldOnChangeMock,
    onBlur: fieldOnBlurMock,
    ref: fieldRefMock,
  });

  useFormContextMock.mockReturnValue({
    register: registerMock,
    clearErrors: clearErrorsMock,
    formState: {
      errors,
    },
  });
}

describe("FormTextField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configurarFormulario();
  });

  it("deve renderizar label, input e placeholder", () => {
    render(
      <FormTextField<TestForm>
        name="nome"
        label="Nome da empresa"
        placeholder="Digite o nome"
      />,
    );

    const input = screen.getByRole("textbox", {
      name: /nome da empresa/i,
    });

    expect(screen.getByText("Nome da empresa")).toBeInTheDocument();

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "nome");
    expect(input).toHaveAttribute("name", "nome");
    expect(input).toHaveAttribute("placeholder", "Digite o nome");

    expect(registerMock).toHaveBeenCalledWith("nome");
  });

  it("deve renderizar o input sem placeholder", () => {
    render(<FormTextField<TestForm> name="nome" label="Nome da empresa" />);

    expect(
      screen.getByRole("textbox", {
        name: /nome da empresa/i,
      }),
    ).not.toHaveAttribute("placeholder");
  });

  it("deve chamar field.onChange e limpar os erros do campo", () => {
    render(<FormTextField<TestForm> name="nome" label="Nome da empresa" />);

    const input = screen.getByRole("textbox", {
      name: /nome da empresa/i,
    });

    fireEvent.change(input, {
      target: {
        value: "Empresa Teste",
      },
    });

    expect(fieldOnChangeMock).toHaveBeenCalledTimes(1);
    expect(fieldOnChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: "Empresa Teste",
        }),
      }),
    );

    expect(clearErrorsMock).toHaveBeenCalledTimes(1);
    expect(clearErrorsMock).toHaveBeenCalledWith("nome");
  });

  it("não deve exibir mensagem quando não existe erro", () => {
    configurarFormulario({});

    render(<FormTextField<TestForm> name="nome" label="Nome da empresa" />);

    expect(document.querySelector(".text-destructive")).not.toBeInTheDocument();
  });

  it("deve exibir mensagem de erro do tipo string", () => {
    configurarFormulario({
      nome: {
        message: "Nome é obrigatório",
      },
    });

    render(<FormTextField<TestForm> name="nome" label="Nome da empresa" />);

    expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
  });

  it("não deve exibir mensagem quando a string está vazia", () => {
    configurarFormulario({
      nome: {
        message: "",
      },
    });

    render(<FormTextField<TestForm> name="nome" label="Nome da empresa" />);

    expect(document.querySelector(".text-destructive")).not.toBeInTheDocument();
  });

  it("deve converter mensagem numérica para string", () => {
    configurarFormulario({
      nome: {
        message: 123,
      },
    });

    render(<FormTextField<TestForm> name="nome" label="Nome da empresa" />);

    expect(screen.getByText("123")).toBeInTheDocument();
  });

  it("deve converter zero para string", () => {
    configurarFormulario({
      nome: {
        message: 0,
      },
    });

    render(<FormTextField<TestForm> name="nome" label="Nome da empresa" />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("deve converter mensagem booleana true para string", () => {
    configurarFormulario({
      nome: {
        message: true,
      },
    });

    render(<FormTextField<TestForm> name="nome" label="Nome da empresa" />);

    expect(screen.getByText("true")).toBeInTheDocument();
  });

  it("deve converter mensagem booleana false para string", () => {
    configurarFormulario({
      nome: {
        message: false,
      },
    });

    render(<FormTextField<TestForm> name="nome" label="Nome da empresa" />);

    expect(screen.getByText("false")).toBeInTheDocument();
  });

  it("não deve exibir mensagem para tipo não suportado", () => {
    configurarFormulario({
      nome: {
        message: {
          texto: "Erro inválido",
        },
      },
    });

    render(<FormTextField<TestForm> name="nome" label="Nome da empresa" />);

    expect(document.querySelector(".text-destructive")).not.toBeInTheDocument();
  });

  it("não deve exibir mensagem quando o erro não possui message", () => {
    configurarFormulario({
      nome: {
        type: "required",
      },
    });

    render(<FormTextField<TestForm> name="nome" label="Nome da empresa" />);

    expect(document.querySelector(".text-destructive")).not.toBeInTheDocument();
  });
});
