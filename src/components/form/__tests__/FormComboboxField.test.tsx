import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FormComboboxField } from "@/components/form/FormComboboxField";

type FormularioTeste = {
  empresa: string;
};

type Opcao = {
  label: string;
  value: string;
};

type ComponenteTesteProps = {
  valorInicial?: string;
  erro?: string;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  helperText?: string;
  options?: Opcao[];
};

vi.mock("@/components/ui/popover", () => ({
  Popover: ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange: (aberto: boolean) => void;
    children: ReactNode;
  }) => (
    <div>
      <button
        type="button"
        aria-label="Alternar popover"
        onClick={() => {
          onOpenChange(!open);
        }}
      >
        Alternar
      </button>

      {children}
    </div>
  ),

  PopoverTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,

  PopoverContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}));

vi.mock("@/components/ui/command", () => ({
  Command: ({ children }: { children: ReactNode }) => <div>{children}</div>,

  CommandInput: ({ placeholder }: { placeholder?: string }) => (
    <input placeholder={placeholder} />
  ),

  CommandList: ({ children }: { children: ReactNode }) => <div>{children}</div>,

  CommandEmpty: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),

  CommandGroup: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),

  CommandItem: ({
    children,
    onSelect,
    value,
  }: {
    children: ReactNode;
    onSelect?: () => void;
    value?: string;
  }) => (
    <button
      type="button"
      data-value={value}
      onClick={() => {
        onSelect?.();
      }}
    >
      {children}
    </button>
  ),
}));

const opcoesPadrao: Opcao[] = [
  {
    label: "Empresa Um",
    value: "empresa-1",
  },
  {
    label: "Empresa Dois",
    value: "empresa-2",
  },
];

function ComponenteTeste({
  valorInicial = "",
  erro,
  disabled = false,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  helperText,
  options = opcoesPadrao,
}: ComponenteTesteProps) {
  const methods = useForm<FormularioTeste>({
    defaultValues: {
      empresa: valorInicial,
    },
  });

  useEffect(() => {
    if (!erro) {
      return;
    }

    methods.setError("empresa", {
      message: erro,
    });
  }, [erro, methods]);

  const valorEmpresa = methods.watch("empresa");

  return (
    <FormProvider {...methods}>
      <FormComboboxField<FormularioTeste>
        name="empresa"
        label="Empresa"
        options={options}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        helperText={helperText}
        disabled={disabled}
      />

      <output data-testid="valor-empresa">{valorEmpresa}</output>
    </FormProvider>
  );
}

describe("FormComboboxField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza os valores padrão", () => {
    render(<ComponenteTeste />);

    expect(screen.getByText("Empresa")).toBeInTheDocument();

    expect(screen.getByLabelText("Empresa")).toHaveTextContent(
      "Selecione uma opção",
    );

    expect(screen.getByPlaceholderText("Pesquisar...")).toBeInTheDocument();

    expect(screen.getByText("Nenhuma opção encontrada.")).toBeInTheDocument();

    expect(screen.getByText("Empresa Um")).toBeInTheDocument();
    expect(screen.getByText("Empresa Dois")).toBeInTheDocument();
  });

  it("renderiza textos personalizados", () => {
    render(
      <ComponenteTeste
        placeholder="Digite o nome da empresa..."
        searchPlaceholder="Digite o CNPJ ou nome..."
        emptyMessage="Nenhuma empresa encontrada."
        helperText="Pesquise pelo CNPJ ou nome da empresa"
      />,
    );

    expect(screen.getByLabelText("Empresa")).toHaveTextContent(
      "Digite o nome da empresa...",
    );

    expect(
      screen.getByPlaceholderText("Digite o CNPJ ou nome..."),
    ).toBeInTheDocument();

    expect(screen.getByText("Nenhuma empresa encontrada.")).toBeInTheDocument();

    expect(
      screen.getByText("Pesquise pelo CNPJ ou nome da empresa"),
    ).toBeInTheDocument();
  });

  it("seleciona uma empresa", () => {
    render(<ComponenteTeste />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar popover",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Empresa Dois",
      }),
    );

    expect(screen.getByTestId("valor-empresa")).toHaveTextContent("empresa-2");

    expect(screen.getByLabelText("Empresa")).toHaveTextContent("Empresa Dois");
  });

  it("exibe uma opção previamente selecionada", () => {
    render(<ComponenteTeste valorInicial="empresa-1" />);

    expect(screen.getByLabelText("Empresa")).toHaveTextContent("Empresa Um");

    expect(screen.getByTestId("valor-empresa")).toHaveTextContent("empresa-1");
  });

  it("marca visualmente a opção selecionada", () => {
    render(<ComponenteTeste valorInicial="empresa-1" />);

    const opcaoSelecionada = screen.getByRole("button", {
      name: "Empresa Um",
    });

    const opcaoNaoSelecionada = screen.getByRole("button", {
      name: "Empresa Dois",
    });

    expect(opcaoSelecionada.querySelector("svg")).toHaveClass("opacity-100");

    expect(opcaoNaoSelecionada.querySelector("svg")).toHaveClass("opacity-0");
  });

  it("abre e fecha o combobox", () => {
    render(<ComponenteTeste />);

    const botaoCampo = screen.getByLabelText("Empresa");
    const iconeSeta = botaoCampo.querySelector("svg");

    expect(iconeSeta).not.toHaveClass("rotate-180");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar popover",
      }),
    );

    expect(iconeSeta).toHaveClass("rotate-180");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar popover",
      }),
    );

    expect(iconeSeta).not.toHaveClass("rotate-180");
  });

  it("fecha o combobox depois de selecionar uma opção", () => {
    render(<ComponenteTeste />);

    const botaoCampo = screen.getByLabelText("Empresa");
    const iconeSeta = botaoCampo.querySelector("svg");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar popover",
      }),
    );

    expect(iconeSeta).toHaveClass("rotate-180");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Empresa Um",
      }),
    );

    expect(iconeSeta).not.toHaveClass("rotate-180");
  });

  it("renderiza a mensagem de erro", async () => {
    render(<ComponenteTeste erro="Empresa é obrigatória." />);

    expect(
      await screen.findByText("Empresa é obrigatória."),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Empresa")).toHaveClass("border-destructive");
  });

  it("desabilita o campo", () => {
    render(<ComponenteTeste disabled />);

    expect(screen.getByLabelText("Empresa")).toBeDisabled();
  });

  it("não renderiza o texto auxiliar quando não informado", () => {
    render(<ComponenteTeste />);

    expect(
      screen.queryByText("Pesquise pelo CNPJ ou nome da empresa"),
    ).not.toBeInTheDocument();
  });
});
