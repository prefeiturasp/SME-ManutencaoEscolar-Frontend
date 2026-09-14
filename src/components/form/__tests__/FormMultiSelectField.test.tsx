import {
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FormMultiSelectField } from "@/components/form/FormMultiSelectField";
import type { Opcao } from "@/components/types/opcao.types";

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
  }) => (
    <div data-testid="popover" data-open={String(open)}>
      <button
        type="button"
        aria-label="Alternar popover"
        onClick={() => onOpenChange(!open)}
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
    value,
    onSelect,
  }: {
    children: ReactNode;
    value: string;
    onSelect: () => void;
  }) => (
    <button type="button" data-value={value} onClick={onSelect}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/form/FormError", () => ({
  FormError: ({ message }: { message: string }) => (
    <div role="alert">{message}</div>
  ),
}));

type FormularioTeste = {
  diretorias: string[] | string;
};

type ComponenteTesteProps = {
  valorInicial?: string[] | string;
  placeholder?: string;
  disabled?: boolean;
  mensagemErro?: string;
  erroSemMensagem?: boolean;
};

const opcoes: Opcao[] = [
  { label: "Diretoria Centro", value: "dre-centro" },
  { label: "Diretoria Norte", value: "dre-norte" },
  { label: "Diretoria Sul", value: "dre-sul" },
];

function ComponenteTeste({
  valorInicial = [],
  placeholder,
  disabled,
  mensagemErro,
  erroSemMensagem = false,
}: ComponenteTesteProps) {
  const methods = useForm<FormularioTeste>({
    defaultValues: {
      diretorias: valorInicial,
    },
  });

  useEffect(() => {
    if (erroSemMensagem) {
      methods.setError("diretorias", { type: "manual" });
      return;
    }

    if (mensagemErro) {
      methods.setError("diretorias", { message: mensagemErro });
    }
  }, [erroSemMensagem, mensagemErro, methods]);

  const valor = useWatch({
    control: methods.control,
    name: "diretorias",
  });

  return (
    <FormProvider {...methods}>
      <FormMultiSelectField<FormularioTeste>
        name="diretorias"
        label="Diretorias regionais"
        options={opcoes}
        placeholder={placeholder}
        disabled={disabled}
      />

      <output data-testid="valor-selecionado">{JSON.stringify(valor)}</output>
      <output data-testid="campo-tocado">
        {String(Boolean(methods.formState.touchedFields.diretorias))}
      </output>
    </FormProvider>
  );
}

function obterCampo(): HTMLDivElement {
  const botao = screen.getByRole("button", {
    name: "Abrir seleção de diretorias regionais",
  });

  return botao.parentElement as HTMLDivElement;
}

describe("FormMultiSelectField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza os textos e estados padrão", () => {
    render(<ComponenteTeste />);

    expect(screen.getByText("Diretorias regionais")).toBeInTheDocument();
    expect(screen.getAllByText("Selecione as opções")).toHaveLength(2);
    expect(screen.getByPlaceholderText("Pesquisar...")).toBeInTheDocument();
    expect(
      screen.getByText("Nenhuma diretoria regional encontrada."),
    ).toBeInTheDocument();

    const botao = screen.getByRole("button", {
      name: "Abrir seleção de diretorias regionais",
    });

    expect(botao).not.toBeDisabled();
    expect(obterCampo()).toHaveAttribute("aria-invalid", "false");
    expect(obterCampo()).not.toHaveClass("cursor-not-allowed", "opacity-50");
  });

  it("renderiza um placeholder personalizado", () => {
    render(<ComponenteTeste placeholder="Selecione as DREs" />);

    expect(screen.getAllByText("Selecione as DREs")).toHaveLength(2);
    expect(screen.queryByText("Selecione as opções")).not.toBeInTheDocument();
  });

  it("trata um valor que não seja array como seleção vazia", () => {
    render(<ComponenteTeste valorInicial="valor-inválido" />);

    expect(screen.getAllByText("Selecione as opções")).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "Remover Diretoria Centro" }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Diretoria Centro",
      }),
    );

    expect(screen.getByTestId("valor-selecionado")).toHaveTextContent(
      '["dre-centro"]',
    );
  });

  it("exibe somente as opções que estão selecionadas", () => {
    render(
      <ComponenteTeste
        valorInicial={["dre-centro", "dre-sul", "opcao-inexistente"]}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Remover Diretoria Centro" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remover Diretoria Sul" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remover Diretoria Norte" }),
    ).not.toBeInTheDocument();
  });

  it("adiciona uma opção pelo menu", () => {
    render(<ComponenteTeste valorInicial={["dre-centro"]} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Diretoria Norte",
      }),
    );

    expect(screen.getByTestId("valor-selecionado")).toHaveTextContent(
      '["dre-centro","dre-norte"]',
    );
    expect(
      screen.getByRole("button", { name: "Remover Diretoria Norte" }),
    ).toBeInTheDocument();
  });

  it("remove uma opção selecionada pelo menu", () => {
    render(<ComponenteTeste valorInicial={["dre-centro", "dre-norte"]} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Diretoria Centro",
      }),
    );

    expect(screen.getByTestId("valor-selecionado")).toHaveTextContent(
      '["dre-norte"]',
    );
  });

  it("remove uma opção pelo badge e bloqueia os eventos do botão", () => {
    render(<ComponenteTeste valorInicial={["dre-centro", "dre-norte"]} />);

    const botaoRemover = screen.getByRole("button", {
      name: "Remover Diretoria Centro",
    });

    const pointerDown = createEvent.pointerDown(botaoRemover);
    fireEvent(botaoRemover, pointerDown);

    expect(pointerDown.defaultPrevented).toBe(true);

    const click = createEvent.click(botaoRemover);
    fireEvent(botaoRemover, click);

    expect(click.defaultPrevented).toBe(true);
    expect(screen.getByTestId("valor-selecionado")).toHaveTextContent(
      '["dre-norte"]',
    );
  });

  it("marca visualmente as opções selecionadas e monta o valor de pesquisa", () => {
    render(<ComponenteTeste valorInicial={["dre-centro"]} />);

    const selecionada = screen.getByRole("button", {
      name: "Diretoria Centro",
    });
    const naoSelecionada = screen.getByRole("button", {
      name: "Diretoria Norte",
    });

    expect(selecionada).toHaveAttribute(
      "data-value",
      "Diretoria Centro dre-centro",
    );
    expect(selecionada.querySelector("svg")).toHaveClass("opacity-100");
    expect(naoSelecionada.querySelector("svg")).toHaveClass("opacity-0");
  });

  it("abre e fecha o popover, aplica o destaque e marca o campo como tocado", () => {
    render(<ComponenteTeste />);

    const alternar = screen.getByRole("button", { name: "Alternar popover" });

    expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "false");
    expect(obterCampo()).not.toHaveClass("border-ring");
    expect(screen.getByTestId("campo-tocado")).toHaveTextContent("false");

    fireEvent.click(alternar);

    expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "true");
    expect(obterCampo()).toHaveClass("border-ring", "ring-[3px]");

    fireEvent.click(alternar);

    expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "false");
    expect(obterCampo()).not.toHaveClass("border-ring");
    expect(screen.getByTestId("campo-tocado")).toHaveTextContent("true");
  });

  it("desabilita o campo e aplica os estilos correspondentes", () => {
    render(<ComponenteTeste disabled />);

    expect(
      screen.getByRole("button", {
        name: "Abrir seleção de diretorias regionais",
      }),
    ).toBeDisabled();
    expect(obterCampo()).toHaveClass("cursor-not-allowed", "opacity-50");
  });

  it("renderiza a mensagem e os estilos de erro", async () => {
    render(<ComponenteTeste mensagemErro="Selecione ao menos uma DRE." />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Selecione ao menos uma DRE.",
    );
    expect(obterCampo()).toHaveAttribute("aria-invalid", "true");
    expect(obterCampo()).toHaveClass(
      "border-destructive",
      "ring-[3px]",
      "ring-destructive/20",
    );
    expect(obterCampo()).not.toHaveClass("border-ring");
  });

  it("aplica o estado inválido sem renderizar FormError quando não há mensagem", async () => {
    render(<ComponenteTeste erroSemMensagem />);

    await waitFor(() => {
      expect(obterCampo()).toHaveAttribute("aria-invalid", "true");
    });

    expect(obterCampo()).toHaveClass("border-destructive");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
