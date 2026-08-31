import { FormComboboxField } from "@/components/form/FormComboboxField";
import type { Opcao } from "@/components/types/opcao.types";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";

type FormularioTeste = {
  empresa: string;
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
    <div data-testid="popover" data-open={String(open)}>
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
  Command: ({
    children,
    filter,
  }: {
    children: ReactNode;
    filter?: (value: string, search: string) => number;
  }) => (
    <div
      data-testid="command"
      data-filtro-nome={filter?.(
        "Empresa São João 99.889.215/0001-72",
        "empresa sao joao",
      )}
      data-filtro-cnpj={filter?.(
        "Empresa São João 99.889.215/0001-72",
        "99889215000172",
      )}
      data-filtro-invalido={filter?.(
        "Empresa São João 99.889.215/0001-72",
        "998892150001715",
      )}
    >
      {children}
    </div>
  ),

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
    cnpj: "99.889.215/0001-72",
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

  const valorEmpresa = useWatch({
    control: methods.control,
    name: "empresa",
  });

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

  it("renderiza os textos personalizados", () => {
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

  it("filtra pelo nome ignorando acentos, espaços e maiúsculas", () => {
    render(<ComponenteTeste />);

    expect(screen.getByTestId("command")).toHaveAttribute(
      "data-filtro-nome",
      "1",
    );
  });

  it("filtra pelo CNPJ sem formatação", () => {
    render(<ComponenteTeste />);

    expect(screen.getByTestId("command")).toHaveAttribute(
      "data-filtro-cnpj",
      "1",
    );
  });

  it("rejeita um CNPJ que não corresponde à empresa", () => {
    render(<ComponenteTeste />);

    expect(screen.getByTestId("command")).toHaveAttribute(
      "data-filtro-invalido",
      "0",
    );
  });

  it("utiliza nome e CNPJ como termos de pesquisa", () => {
    render(<ComponenteTeste />);

    const empresaComCnpj = screen.getByRole("button", {
      name: "Empresa Um",
    });

    expect(empresaComCnpj).toHaveAttribute(
      "data-value",
      "Empresa Um 99.889.215/0001-72 99889215000172",
    );

    expect(empresaComCnpj).not.toHaveAttribute(
      "data-value",
      expect.stringContaining("empresa-1"),
    );
  });

  it("aceita uma opção sem CNPJ", () => {
    render(<ComponenteTeste />);

    const empresaSemCnpj = screen.getByRole("button", {
      name: "Empresa Dois",
    });

    expect(empresaSemCnpj).toBeInTheDocument();
    expect(empresaSemCnpj).toHaveAttribute(
      "data-value",
      expect.stringContaining("Empresa Dois"),
    );
  });

  it("seleciona uma empresa e salva seu identificador", () => {
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

    const botaoAlternar = screen.getByRole("button", {
      name: "Alternar popover",
    });

    const botaoCampo = screen.getByLabelText("Empresa");
    const iconeSeta = botaoCampo.querySelector("svg");

    expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "false");

    expect(iconeSeta).not.toHaveClass("rotate-180");

    fireEvent.click(botaoAlternar);

    expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "true");
    expect(iconeSeta).toHaveClass("rotate-180");

    fireEvent.click(botaoAlternar);

    expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "false");

    expect(iconeSeta).not.toHaveClass("rotate-180");
  });

  it("fecha o combobox depois de selecionar uma opção", () => {
    render(<ComponenteTeste />);

    const botaoAlternar = screen.getByRole("button", {
      name: "Alternar popover",
    });

    const botaoCampo = screen.getByLabelText("Empresa");
    const iconeSeta = botaoCampo.querySelector("svg");

    fireEvent.click(botaoAlternar);

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
