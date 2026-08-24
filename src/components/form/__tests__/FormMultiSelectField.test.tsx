import {
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { FormMultiSelectField } from "@/components/form/FormMultiSelectField";

type FormularioTeste = {
  diretorias_regionais: string[];
};

type Opcao = {
  label: string;
  value: string;
};

type ComponenteTesteProps = {
  valoresIniciais?: string[];
  erro?: string;
  placeholder?: string;
  disabled?: boolean;
  options?: Opcao[];
};

type FormularioSemValorInicial = {
  diretorias_regionais?: string[];
};

function ComponenteSemValorInicial() {
  const methods = useForm<FormularioSemValorInicial>({
    defaultValues: {},
  });

  const valores = methods.watch("diretorias_regionais");

  return (
    <FormProvider {...methods}>
      <FormMultiSelectField<FormularioSemValorInicial>
        name="diretorias_regionais"
        label="DRE"
        options={opcoesPadrao}
      />

      <output data-testid="dres-sem-valor-inicial">
        {JSON.stringify(valores)}
      </output>
    </FormProvider>
  );
}

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
    <div data-testid="popover-multiselect" data-open={String(open)}>
      <button
        type="button"
        aria-label="Alternar multiselect"
        onClick={() => {
          onOpenChange(!open);
        }}
      >
        Alternar multiselect
      </button>

      {children}
    </div>
  ),

  PopoverTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,

  PopoverContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="conteudo-multiselect">{children}</div>
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
    label: "DRE PENHA",
    value: "1",
  },
  {
    label: "DRE BUTANTÃ",
    value: "2",
  },
  {
    label: "DRE SÃO MATEUS",
    value: "3",
  },
];

function ComponenteTeste({
  valoresIniciais = [],
  erro,
  placeholder,
  disabled = false,
  options = opcoesPadrao,
}: ComponenteTesteProps) {
  const methods = useForm<FormularioTeste>({
    defaultValues: {
      diretorias_regionais: valoresIniciais,
    },
  });

  useEffect(() => {
    if (!erro) {
      return;
    }

    methods.setError("diretorias_regionais", {
      message: erro,
    });
  }, [erro, methods]);

  const valores = methods.watch("diretorias_regionais");
  const { touchedFields } = methods.formState;

  return (
    <FormProvider {...methods}>
      <FormMultiSelectField<FormularioTeste>
        name="diretorias_regionais"
        label="DRE"
        options={options}
        placeholder={placeholder}
        disabled={disabled}
      />

      <output data-testid="dres-selecionadas">{JSON.stringify(valores)}</output>

      <output data-testid="campos-tocados">
        {JSON.stringify(touchedFields)}
      </output>
    </FormProvider>
  );
}

describe("FormMultiSelectField", () => {
  it("renderiza label, placeholder e campo de pesquisa", () => {
    const { container } = render(<ComponenteTeste />);

    expect(screen.getByText("DRE")).toBeInTheDocument();

    const placeholderVisivel = Array.from(
      container.querySelectorAll("span:not(.sr-only)"),
    ).find((elemento) => elemento.textContent === "Selecione as opções");

    expect(placeholderVisivel).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Pesquisar...")).toBeInTheDocument();

    expect(
      screen.getByText("Nenhuma diretoria regional encontrada."),
    ).toBeInTheDocument();
  });

  it("renderiza um placeholder personalizado", () => {
    const { container } = render(
      <ComponenteTeste placeholder="Selecione uma ou mais DREs" />,
    );

    const placeholderAcessivel = container.querySelector("span.sr-only");

    const placeholderVisivel = Array.from(
      container.querySelectorAll("span:not(.sr-only)"),
    ).find((elemento) => elemento.textContent === "Selecione uma ou mais DREs");

    expect(placeholderAcessivel).toHaveTextContent(
      "Selecione uma ou mais DREs",
    );

    expect(placeholderVisivel).toBeInTheDocument();
  });

  it("adiciona uma diretoria regional", async () => {
    const { container } = render(<ComponenteTeste />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "DRE PENHA",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("dres-selecionadas")).toHaveTextContent(
        '["1"]',
      );
    });

    expect(
      screen.getByRole("button", {
        name: "Remover DRE PENHA",
      }),
    ).toBeInTheDocument();

    const placeholderAcessivel = container.querySelector("span.sr-only");

    const placeholderVisivel = Array.from(
      container.querySelectorAll("span:not(.sr-only)"),
    ).find((elemento) => elemento.textContent === "Selecione as opções");

    expect(placeholderAcessivel).toHaveTextContent("Selecione as opções");

    expect(placeholderVisivel).toBeUndefined();
  });

  it("renderiza as opções disponíveis", () => {
    render(<ComponenteTeste />);

    expect(
      screen.getByRole("button", {
        name: "DRE PENHA",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "DRE BUTANTÃ",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "DRE SÃO MATEUS",
      }),
    ).toBeInTheDocument();
  });

  it("trata valor indefinido como uma lista vazia", async () => {
    const { container } = render(<ComponenteSemValorInicial />);

    const placeholderVisivel = Array.from(
      container.querySelectorAll("span:not(.sr-only)"),
    ).find((elemento) => elemento.textContent === "Selecione as opções");

    expect(placeholderVisivel).toBeInTheDocument();

    expect(screen.getByTestId("dres-sem-valor-inicial")).toBeEmptyDOMElement();

    fireEvent.click(
      screen.getByRole("button", {
        name: "DRE PENHA",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("dres-sem-valor-inicial")).toHaveTextContent(
        '["1"]',
      );
    });

    expect(
      screen.getByRole("button", {
        name: "Remover DRE PENHA",
      }),
    ).toBeInTheDocument();
  });

  it("adiciona mais de uma diretoria regional", () => {
    render(<ComponenteTeste />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "DRE PENHA",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "DRE BUTANTÃ",
      }),
    );

    expect(screen.getByTestId("dres-selecionadas")).toHaveTextContent(
      '["1","2"]',
    );

    expect(
      screen.getByRole("button", {
        name: "Remover DRE PENHA",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Remover DRE BUTANTÃ",
      }),
    ).toBeInTheDocument();
  });

  it("remove uma opção clicando novamente na lista", () => {
    render(<ComponenteTeste valoresIniciais={["1", "2"]} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "DRE PENHA",
      }),
    );

    expect(screen.getByTestId("dres-selecionadas")).toHaveTextContent('["2"]');

    expect(
      screen.queryByRole("button", {
        name: "Remover DRE PENHA",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Remover DRE BUTANTÃ",
      }),
    ).toBeInTheDocument();
  });

  it("remove uma opção pelo botão X", () => {
    render(<ComponenteTeste valoresIniciais={["1", "2"]} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remover DRE PENHA",
      }),
    );

    expect(screen.getByTestId("dres-selecionadas")).toHaveTextContent('["2"]');

    expect(
      screen.queryByRole("button", {
        name: "Remover DRE PENHA",
      }),
    ).not.toBeInTheDocument();
  });

  it("impede o evento pointer down no botão de remover", () => {
    render(<ComponenteTeste valoresIniciais={["1"]} />);

    const botaoRemover = screen.getByRole("button", {
      name: "Remover DRE PENHA",
    });

    const evento = createEvent.pointerDown(botaoRemover);

    fireEvent(botaoRemover, evento);

    expect(evento.defaultPrevented).toBe(true);
  });

  it("exibe as opções previamente selecionadas", () => {
    render(<ComponenteTeste valoresIniciais={["1", "3"]} />);

    expect(
      screen.getByRole("button", {
        name: "Remover DRE PENHA",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Remover DRE SÃO MATEUS",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Remover DRE BUTANTÃ",
      }),
    ).not.toBeInTheDocument();
  });

  it("marca visualmente as opções selecionadas", () => {
    render(<ComponenteTeste valoresIniciais={["1"]} />);

    const opcaoSelecionada = screen.getByRole("button", {
      name: "DRE PENHA",
    });

    const opcaoNaoSelecionada = screen.getByRole("button", {
      name: "DRE BUTANTÃ",
    });

    expect(opcaoSelecionada.querySelector("svg")).toHaveClass("opacity-100");

    expect(opcaoNaoSelecionada.querySelector("svg")).toHaveClass("opacity-0");
  });

  it("mantém o multiselect aberto ao selecionar opções", () => {
    render(<ComponenteTeste />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar multiselect",
      }),
    );

    expect(screen.getByTestId("popover-multiselect")).toHaveAttribute(
      "data-open",
      "true",
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "DRE PENHA",
      }),
    );

    expect(screen.getByTestId("popover-multiselect")).toHaveAttribute(
      "data-open",
      "true",
    );
  });

  it("marca o campo como tocado ao fechar", async () => {
    render(<ComponenteTeste />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar multiselect",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar multiselect",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("campos-tocados")).toHaveTextContent(
        '"diretorias_regionais":true',
      );
    });
  });

  it("renderiza a mensagem de erro", async () => {
    render(<ComponenteTeste erro="Selecione pelo menos uma DRE." />);

    expect(
      await screen.findByText("Selecione pelo menos uma DRE."),
    ).toBeInTheDocument();

    const botaoAbrir = screen.getByRole("button", {
      name: "Abrir seleção de diretorias regionais",
    });

    expect(botaoAbrir.parentElement).toHaveClass("border-destructive");
  });

  it("desabilita o campo", () => {
    render(<ComponenteTeste disabled />);

    expect(
      screen.getByRole("button", {
        name: "Abrir seleção de diretorias regionais",
      }),
    ).toBeDisabled();
  });

  it("aplica o estado visual desabilitado no container", () => {
    render(<ComponenteTeste disabled />);

    const botaoAbrir = screen.getByRole("button", {
      name: "Abrir seleção de diretorias regionais",
    });

    expect(botaoAbrir.parentElement).toHaveClass(
      "cursor-not-allowed",
      "opacity-50",
    );
  });
});
