import type { ComponentProps, ReactNode } from "react";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DateRangeField } from "../shared/DateRangeField/DateRangeField";

vi.mock("@/components/form", () => ({
  FormError: ({ message }: { message: string }) => (
    <div role="alert">{message}</div>
  ),
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({
    children,
    open,
    onOpenChange,
  }: {
    children: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div data-testid="popover" data-open={String(open)}>
      <button type="button" onClick={() => onOpenChange(true)}>
        Abrir calendário
      </button>

      <button type="button" onClick={() => onOpenChange(false)}>
        Fechar calendário
      </button>

      {children}
    </div>
  ),

  PopoverTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,

  PopoverContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("react-day-picker", () => ({
  DayPicker: ({
    month,
    selected,
    onMonthChange,
    onSelect,
  }: {
    month: Date;
    selected?: {
      from?: Date;
      to?: Date;
    };
    onMonthChange: (month: Date) => void;
    onSelect: (
      intervalo:
        | {
            from?: Date;
            to?: Date;
          }
        | undefined,
    ) => void;
  }) => (
    <div
      data-testid="day-picker"
      data-month={`${month.getFullYear()}-${month.getMonth() + 1}`}
      data-selected-from={selected?.from?.toISOString() ?? ""}
      data-selected-to={selected?.to?.toISOString() ?? ""}
    >
      <button type="button" onClick={() => onSelect(undefined)}>
        Limpar intervalo
      </button>

      <button
        type="button"
        onClick={() => {
          onSelect({
            from: new Date(2026, 0, 10),
          });
        }}
      >
        Selecionar início
      </button>

      <button
        type="button"
        onClick={() => {
          onSelect({
            from: new Date(2026, 0, 10),
            to: new Date(2026, 0, 10),
          });
        }}
      >
        Selecionar mesmo dia
      </button>

      <button
        type="button"
        onClick={() => {
          onSelect({
            from: new Date(2026, 0, 10),
            to: new Date(2026, 0, 20),
          });
        }}
      >
        Selecionar intervalo
      </button>

      <button
        type="button"
        onClick={() => {
          onMonthChange(new Date(2025, 4, 1));
        }}
      >
        Alterar mês pelo calendário
      </button>
    </div>
  ),
}));

type Propriedades = ComponentProps<typeof DateRangeField>;

function criarPropriedades(
  sobrescritas: Partial<Propriedades> = {},
): Propriedades {
  return {
    id: "periodo-licitacao",
    dataInicial: "",
    dataFinal: "",
    label: "Período da licitação",
    onMudarDataInicial: vi.fn<(value: string) => void>(),
    onMudarDataFinal: vi.fn<(value: string) => void>(),
    ...sobrescritas,
  };
}

describe("DateRangeField", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 27));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("deve exibir o rótulo e as datas vazias", () => {
    render(<DateRangeField {...criarPropriedades()} />);

    expect(screen.getByText("Período da licitação")).toBeInTheDocument();

    expect(screen.getAllByText("00/00/0000")).toHaveLength(2);

    expect(screen.getByTestId("day-picker")).toHaveAttribute(
      "data-selected-from",
      "",
    );
  });

  it("deve formatar as datas recebidas", () => {
    render(
      <DateRangeField
        {...criarPropriedades({
          dataInicial: "2026-01-10",
          dataFinal: "2026-01-20",
        })}
      />,
    );

    expect(screen.getByText("10/01/2026")).toBeInTheDocument();

    expect(screen.getByText("20/01/2026")).toBeInTheDocument();

    expect(screen.getByTestId("day-picker")).not.toHaveAttribute(
      "data-selected-from",
      "",
    );

    expect(screen.getByTestId("day-picker")).not.toHaveAttribute(
      "data-selected-to",
      "",
    );
  });

  it("deve tratar datas inválidas como vazias", () => {
    render(
      <DateRangeField
        {...criarPropriedades({
          dataInicial: "data-invalida",
          dataFinal: "data-invalida",
        })}
      />,
    );

    expect(screen.getAllByText("00/00/0000")).toHaveLength(2);
  });

  it("deve utilizar falso como padrão de disabled", () => {
    render(<DateRangeField {...criarPropriedades()} />);

    expect(
      screen.getByRole("button", {
        name: "Período da licitação",
      }),
    ).not.toBeDisabled();
  });

  it("deve desabilitar o botão principal", () => {
    render(
      <DateRangeField
        {...criarPropriedades({
          disabled: true,
        })}
      />,
    );

    const botao = screen.getByRole("button", {
      name: "Período da licitação",
    });

    expect(botao).toBeDisabled();
    expect(botao).toHaveClass("cursor-not-allowed", "opacity-50");
  });

  it("deve exibir a mensagem de erro", () => {
    render(
      <DateRangeField
        {...criarPropriedades({
          mensagemErro: "Período obrigatório.",
        })}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Período obrigatório.");

    expect(
      screen.getByRole("button", {
        name: "Período da licitação",
      }),
    ).toHaveClass("border-destructive");
  });

  it("não deve exibir erro quando não houver mensagem", () => {
    render(<DateRangeField {...criarPropriedades()} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("deve abrir no mês da data inicial", () => {
    render(
      <DateRangeField
        {...criarPropriedades({
          dataInicial: "2026-03-15",
        })}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Abrir calendário",
      }),
    );

    expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "true");

    expect(screen.getByTestId("day-picker")).toHaveAttribute(
      "data-month",
      "2026-3",
    );

    expect(screen.getByText("Mar")).toBeInTheDocument();
  });

  it("deve abrir sem alterar o mês quando não houver data inicial", () => {
    render(<DateRangeField {...criarPropriedades()} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Abrir calendário",
      }),
    );

    expect(screen.getByTestId("day-picker")).toHaveAttribute(
      "data-month",
      "2026-8",
    );
  });

  it("deve executar onFechar ao fechar o calendário", () => {
    const onFechar = vi.fn();

    render(
      <DateRangeField
        {...criarPropriedades({
          onFechar,
        })}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Abrir calendário",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fechar calendário",
      }),
    );

    expect(onFechar).toHaveBeenCalledOnce();
  });

  it("deve fechar mesmo sem callback onFechar", () => {
    render(<DateRangeField {...criarPropriedades()} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Abrir calendário",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fechar calendário",
      }),
    );

    expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "false");
  });

  it("deve limpar as duas datas", () => {
    const propriedades = criarPropriedades();

    render(<DateRangeField {...propriedades} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Limpar intervalo",
      }),
    );

    expect(propriedades.onMudarDataInicial).toHaveBeenCalledWith("");

    expect(propriedades.onMudarDataFinal).toHaveBeenCalledWith("");
  });

  it("deve selecionar somente a data inicial", () => {
    const propriedades = criarPropriedades();

    render(<DateRangeField {...propriedades} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar início",
      }),
    );

    expect(propriedades.onMudarDataInicial).toHaveBeenCalledWith("2026-01-10");

    expect(propriedades.onMudarDataFinal).toHaveBeenCalledWith("");
  });

  it("deve permitir selecionar o mesmo dia sem fechar", () => {
    const propriedades = criarPropriedades();
    const onFechar = vi.fn();

    render(<DateRangeField {...propriedades} onFechar={onFechar} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Abrir calendário",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar mesmo dia",
      }),
    );

    expect(propriedades.onMudarDataInicial).toHaveBeenCalledWith("2026-01-10");

    expect(propriedades.onMudarDataFinal).toHaveBeenCalledWith("2026-01-10");

    expect(onFechar).not.toHaveBeenCalled();

    expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "true");
  });

  it("deve selecionar o intervalo completo e fechar", () => {
    const propriedades = criarPropriedades();
    const onFechar = vi.fn();

    render(<DateRangeField {...propriedades} onFechar={onFechar} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Abrir calendário",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar intervalo",
      }),
    );

    expect(propriedades.onMudarDataInicial).toHaveBeenCalledWith("2026-01-10");

    expect(propriedades.onMudarDataFinal).toHaveBeenCalledWith("2026-01-20");

    expect(onFechar).toHaveBeenCalledOnce();

    expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "false");
  });

  it("deve fechar o intervalo completo sem callback", () => {
    render(<DateRangeField {...criarPropriedades()} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Abrir calendário",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar intervalo",
      }),
    );

    expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "false");
  });

  it("deve navegar entre os meses", () => {
    render(<DateRangeField {...criarPropriedades()} />);

    expect(screen.getByText("Ago")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Voltar um mês",
      }),
    );

    expect(screen.getByText("Jul")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Avançar um mês",
      }),
    );

    expect(screen.getByText("Ago")).toBeInTheDocument();
  });

  it("deve navegar entre os anos", () => {
    render(<DateRangeField {...criarPropriedades()} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Voltar um ano",
      }),
    );

    expect(screen.getByText("2025")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Avançar um ano",
      }),
    );

    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  it("deve aceitar a mudança de mês do DayPicker", () => {
    render(<DateRangeField {...criarPropriedades()} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alterar mês pelo calendário",
      }),
    );

    expect(screen.getByTestId("day-picker")).toHaveAttribute(
      "data-month",
      "2025-5",
    );

    expect(screen.getByText("Mai")).toBeInTheDocument();
  });
});
