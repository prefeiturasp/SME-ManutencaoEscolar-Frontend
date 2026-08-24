import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { FormDateRangeField } from "@/components/form/FormDateRangeField";

type FormularioTeste = {
  periodo_inicial: string;
  periodo_final: string;
};

type ErrosFormulario = Partial<Record<keyof FormularioTeste, string>>;

type ComponenteTesteProps = {
  periodoInicial?: string;
  periodoFinal?: string;
  erros?: ErrosFormulario;
  disabled?: boolean;
};

type IntervaloData =
  | {
      from?: Date;
      to?: Date;
    }
  | undefined;

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
    <div data-testid="popover-calendario" data-open={String(open)}>
      <button
        type="button"
        aria-label="Alternar calendário"
        onClick={() => {
          onOpenChange(!open);
        }}
      >
        Alternar calendário
      </button>

      {children}
    </div>
  ),

  PopoverTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,

  PopoverContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="conteudo-calendario">{children}</div>
  ),
}));

vi.mock("react-day-picker", () => ({
  DayPicker: ({
    month,
    selected,
    onSelect,
  }: {
    month: Date;
    selected?: {
      from?: Date;
      to?: Date;
    };
    onSelect?: (intervalo: IntervaloData) => void;
  }) => (
    <div data-testid="day-picker">
      <output data-testid="mes-calendario">
        {`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(
          2,
          "0",
        )}`}
      </output>

      <output data-testid="data-inicial-selecionada">
        {selected?.from
          ? `${selected.from.getFullYear()}-${String(
              selected.from.getMonth() + 1,
            ).padStart(2, "0")}-${String(selected.from.getDate()).padStart(
              2,
              "0",
            )}`
          : ""}
      </output>

      <output data-testid="data-final-selecionada">
        {selected?.to
          ? `${selected.to.getFullYear()}-${String(
              selected.to.getMonth() + 1,
            ).padStart(2, "0")}-${String(selected.to.getDate()).padStart(
              2,
              "0",
            )}`
          : ""}
      </output>

      <button
        type="button"
        onClick={() => {
          onSelect?.({
            from: new Date(2026, 4, 10),
          });
        }}
      >
        Selecionar data inicial
      </button>

      <button
        type="button"
        onClick={() => {
          onSelect?.({
            from: new Date(2026, 4, 10),
            to: new Date(2026, 4, 10),
          });
        }}
      >
        Selecionar a mesma data
      </button>

      <button
        type="button"
        onClick={() => {
          onSelect?.({
            from: new Date(2026, 4, 10),
            to: new Date(2026, 4, 20),
          });
        }}
      >
        Selecionar intervalo
      </button>

      <button
        type="button"
        onClick={() => {
          onSelect?.(undefined);
        }}
      >
        Limpar intervalo
      </button>
    </div>
  ),
}));

function ComponenteTeste({
  periodoInicial = "",
  periodoFinal = "",
  erros,
  disabled = false,
}: ComponenteTesteProps) {
  const methods = useForm<FormularioTeste>({
    defaultValues: {
      periodo_inicial: periodoInicial,
      periodo_final: periodoFinal,
    },
  });

  useEffect(() => {
    if (!erros) {
      return;
    }

    if (erros.periodo_inicial) {
      methods.setError("periodo_inicial", {
        message: erros.periodo_inicial,
      });
    }

    if (erros.periodo_final) {
      methods.setError("periodo_final", {
        message: erros.periodo_final,
      });
    }
  }, [erros, methods]);

  const valores = methods.watch();
  const { touchedFields } = methods.formState;

  return (
    <FormProvider {...methods}>
      <FormDateRangeField<FormularioTeste>
        nameInicial="periodo_inicial"
        nameFinal="periodo_final"
        label="Período da licitação"
        disabled={disabled}
      />

      <output data-testid="valores-formulario">
        {JSON.stringify(valores)}
      </output>

      <output data-testid="campos-tocados">
        {JSON.stringify(touchedFields)}
      </output>
    </FormProvider>
  );
}

describe("FormDateRangeField", () => {
  it("renderiza os placeholders quando não existem datas", () => {
    render(<ComponenteTeste />);

    expect(screen.getByText("Período da licitação")).toBeInTheDocument();

    expect(screen.getAllByText("00/00/0000")).toHaveLength(2);

    expect(screen.getByLabelText("Período da licitação")).toBeInTheDocument();
  });

  it("formata as datas recebidas no padrão brasileiro", () => {
    render(
      <ComponenteTeste periodoInicial="2026-05-10" periodoFinal="2026-05-20" />,
    );

    expect(screen.getByText("10/05/2026")).toBeInTheDocument();
    expect(screen.getByText("20/05/2026")).toBeInTheDocument();

    expect(screen.getByTestId("data-inicial-selecionada")).toHaveTextContent(
      "2026-05-10",
    );

    expect(screen.getByTestId("data-final-selecionada")).toHaveTextContent(
      "2026-05-20",
    );
  });

  it("exibe placeholder para uma data inválida", () => {
    render(
      <ComponenteTeste
        periodoInicial="data-invalida"
        periodoFinal="outra-data-invalida"
      />,
    );

    expect(screen.getAllByText("00/00/0000")).toHaveLength(2);
  });

  it("abre o calendário no mês da data inicial", () => {
    render(
      <ComponenteTeste periodoInicial="2026-05-10" periodoFinal="2026-05-20" />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar calendário",
      }),
    );

    expect(screen.getByTestId("popover-calendario")).toHaveAttribute(
      "data-open",
      "true",
    );

    expect(screen.getByTestId("mes-calendario")).toHaveTextContent("2026-05");

    expect(screen.getByText("2026")).toBeInTheDocument();
    expect(screen.getByText("Mai")).toBeInTheDocument();
  });

  it("seleciona somente a data inicial", () => {
    render(<ComponenteTeste />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar calendário",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar data inicial",
      }),
    );

    expect(screen.getByText("10/05/2026")).toBeInTheDocument();

    expect(screen.getByTestId("valores-formulario")).toHaveTextContent(
      '"periodo_inicial":"2026-05-10"',
    );

    expect(screen.getByTestId("valores-formulario")).toHaveTextContent(
      '"periodo_final":""',
    );

    // Continua aberto até selecionar a segunda data.
    expect(screen.getByTestId("popover-calendario")).toHaveAttribute(
      "data-open",
      "true",
    );
  });

  it("mantém o calendário aberto quando as datas são iguais", () => {
    render(<ComponenteTeste />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar calendário",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar a mesma data",
      }),
    );

    expect(screen.getByTestId("valores-formulario")).toHaveTextContent(
      '"periodo_inicial":"2026-05-10"',
    );

    expect(screen.getByTestId("valores-formulario")).toHaveTextContent(
      '"periodo_final":"2026-05-10"',
    );

    expect(screen.getByTestId("popover-calendario")).toHaveAttribute(
      "data-open",
      "true",
    );
  });

  it("seleciona o intervalo e fecha o calendário", () => {
    render(<ComponenteTeste />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar calendário",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar intervalo",
      }),
    );

    expect(screen.getByText("10/05/2026")).toBeInTheDocument();
    expect(screen.getByText("20/05/2026")).toBeInTheDocument();

    expect(screen.getByTestId("valores-formulario")).toHaveTextContent(
      '"periodo_inicial":"2026-05-10"',
    );

    expect(screen.getByTestId("valores-formulario")).toHaveTextContent(
      '"periodo_final":"2026-05-20"',
    );

    expect(screen.getByTestId("popover-calendario")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("limpa as duas datas", () => {
    render(
      <ComponenteTeste periodoInicial="2026-05-10" periodoFinal="2026-05-20" />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Limpar intervalo",
      }),
    );

    expect(screen.getAllByText("00/00/0000")).toHaveLength(2);

    expect(screen.getByTestId("valores-formulario")).toHaveTextContent(
      '"periodo_inicial":""',
    );

    expect(screen.getByTestId("valores-formulario")).toHaveTextContent(
      '"periodo_final":""',
    );
  });

  it("permite voltar e avançar um ano", () => {
    render(<ComponenteTeste periodoInicial="2026-05-10" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar calendário",
      }),
    );

    expect(screen.getByTestId("mes-calendario")).toHaveTextContent("2026-05");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Voltar um ano",
      }),
    );

    expect(screen.getByTestId("mes-calendario")).toHaveTextContent("2025-05");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Avançar um ano",
      }),
    );

    expect(screen.getByTestId("mes-calendario")).toHaveTextContent("2026-05");
  });

  it("permite voltar e avançar um mês", () => {
    render(<ComponenteTeste periodoInicial="2026-05-10" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar calendário",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Voltar um mês",
      }),
    );

    expect(screen.getByTestId("mes-calendario")).toHaveTextContent("2026-04");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Avançar um mês",
      }),
    );

    expect(screen.getByTestId("mes-calendario")).toHaveTextContent("2026-05");
  });

  it("marca os dois campos como tocados ao fechar", async () => {
    render(<ComponenteTeste />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar calendário",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar calendário",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("campos-tocados")).toHaveTextContent(
        '"periodo_inicial":true',
      );

      expect(screen.getByTestId("campos-tocados")).toHaveTextContent(
        '"periodo_final":true',
      );
    });
  });

  it("renderiza o erro do período inicial", async () => {
    render(
      <ComponenteTeste
        erros={{
          periodo_inicial: "Período inicial obrigatório.",
        }}
      />,
    );

    expect(
      await screen.findByText("Período inicial obrigatório."),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Período da licitação")).toHaveClass(
      "border-destructive",
    );
  });

  it("renderiza o erro do período final", async () => {
    render(
      <ComponenteTeste
        erros={{
          periodo_final: "O período final não pode ser anterior.",
        }}
      />,
    );

    expect(
      await screen.findByText("O período final não pode ser anterior."),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Período da licitação")).toHaveClass(
      "border-destructive",
    );
  });

  it("prioriza o erro inicial quando os dois campos têm erro", async () => {
    render(
      <ComponenteTeste
        erros={{
          periodo_inicial: "Erro no período inicial.",
          periodo_final: "Erro no período final.",
        }}
      />,
    );

    expect(
      await screen.findByText("Erro no período inicial."),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Erro no período final."),
    ).not.toBeInTheDocument();
  });

  it("desabilita o campo", () => {
    render(<ComponenteTeste disabled />);

    expect(screen.getByLabelText("Período da licitação")).toBeDisabled();
  });
});
