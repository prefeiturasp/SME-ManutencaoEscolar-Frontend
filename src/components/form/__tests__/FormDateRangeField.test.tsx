import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FormDateRangeField } from "../FormDateRangeField";

const mocks = vi.hoisted(() => ({
  useController: vi.fn(),
  useFormContext: vi.fn(),
  trigger: vi.fn(),
  onChangeInicial: vi.fn(),
  onChangeFinal: vi.fn(),
  onBlurInicial: vi.fn(),
  onBlurFinal: vi.fn(),
}));

vi.mock("react-hook-form", () => ({
  useController: mocks.useController,
  useFormContext: mocks.useFormContext,
}));

vi.mock("@/components/shared/DateRangeField/DateRangeField", () => ({
  DateRangeField: ({
    id,
    dataInicial,
    dataFinal,
    label,
    disabled,
    mensagemErro,
    onMudarDataInicial,
    onMudarDataFinal,
    onFechar,
  }: {
    id: string;
    dataInicial: string;
    dataFinal: string;
    label: string;
    disabled: boolean;
    mensagemErro?: string;
    onMudarDataInicial: (value: string) => void;
    onMudarDataFinal: (value: string) => void;
    onFechar: () => void;
  }) => (
    <div
      data-testid="date-range-field"
      data-id={id}
      data-inicial={dataInicial}
      data-final={dataFinal}
      data-disabled={String(disabled)}
      data-mensagem-erro={mensagemErro ?? ""}
    >
      <span>{label}</span>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          onMudarDataInicial("2026-01-10");
        }}
      >
        Alterar data inicial
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          onMudarDataFinal("2026-12-20");
        }}
      >
        Alterar data final
      </button>

      <button type="button" onClick={onFechar}>
        Fechar período
      </button>
    </div>
  ),
}));

type FormularioTeste = {
  periodo_inicial: string;
  periodo_final: string;
};

type EstadoCampo = {
  field: {
    value: unknown;
    onChange: ReturnType<typeof vi.fn>;
    onBlur: ReturnType<typeof vi.fn>;
  };
  fieldState: {
    error?: {
      message?: string;
    };
  };
};

let campoInicial: EstadoCampo;
let campoFinal: EstadoCampo;

function renderizarComponente(
  propriedades: {
    disabled?: boolean;
  } = {},
) {
  return render(
    <FormDateRangeField<FormularioTeste>
      nameInicial="periodo_inicial"
      nameFinal="periodo_final"
      label="Período da licitação"
      {...propriedades}
    />,
  );
}

describe("FormDateRangeField", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    campoInicial = {
      field: {
        value: "2026-01-10",
        onChange: mocks.onChangeInicial,
        onBlur: mocks.onBlurInicial,
      },
      fieldState: {},
    };

    campoFinal = {
      field: {
        value: "2026-12-20",
        onChange: mocks.onChangeFinal,
        onBlur: mocks.onBlurFinal,
      },
      fieldState: {},
    };

    mocks.useFormContext.mockReturnValue({
      control: {},
      trigger: mocks.trigger,
    });

    mocks.useController.mockImplementation(({ name }: { name: string }) => {
      if (name === "periodo_inicial") {
        return campoInicial;
      }

      return campoFinal;
    });

    mocks.trigger.mockResolvedValue(true);
  });

  it("deve encaminhar os valores dos campos", () => {
    renderizarComponente();

    const componente = screen.getByTestId("date-range-field");

    expect(componente).toHaveAttribute("data-id", "periodo_inicial-periodo");
    expect(componente).toHaveAttribute("data-inicial", "2026-01-10");
    expect(componente).toHaveAttribute("data-final", "2026-12-20");
    expect(screen.getByText("Período da licitação")).toBeInTheDocument();
  });

  it("deve utilizar strings vazias para valores inválidos", () => {
    campoInicial.field.value = undefined;
    campoFinal.field.value = null;

    renderizarComponente();

    const componente = screen.getByTestId("date-range-field");

    expect(componente).toHaveAttribute("data-inicial", "");
    expect(componente).toHaveAttribute("data-final", "");
  });

  it("deve usar falso como valor padrão de disabled", () => {
    renderizarComponente();

    expect(screen.getByTestId("date-range-field")).toHaveAttribute(
      "data-disabled",
      "false",
    );

    expect(
      screen.getByRole("button", {
        name: "Alterar data inicial",
      }),
    ).not.toBeDisabled();
  });

  it("deve encaminhar o estado desabilitado", () => {
    renderizarComponente({
      disabled: true,
    });

    expect(screen.getByTestId("date-range-field")).toHaveAttribute(
      "data-disabled",
      "true",
    );

    expect(
      screen.getByRole("button", {
        name: "Alterar data inicial",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Alterar data final",
      }),
    ).toBeDisabled();
  });

  it("deve encaminhar o erro do período inicial", () => {
    campoInicial.fieldState.error = {
      message: "Data inicial obrigatória.",
    };

    renderizarComponente();

    expect(screen.getByTestId("date-range-field")).toHaveAttribute(
      "data-mensagem-erro",
      "Data inicial obrigatória.",
    );
  });

  it("deve usar o erro final quando não houver erro inicial", () => {
    campoFinal.fieldState.error = {
      message: "Data final obrigatória.",
    };

    renderizarComponente();

    expect(screen.getByTestId("date-range-field")).toHaveAttribute(
      "data-mensagem-erro",
      "Data final obrigatória.",
    );
  });

  it("não deve encaminhar mensagem quando não houver erro", () => {
    renderizarComponente();

    expect(screen.getByTestId("date-range-field")).toHaveAttribute(
      "data-mensagem-erro",
      "",
    );
  });

  it("deve encaminhar a alteração da data inicial", () => {
    renderizarComponente();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alterar data inicial",
      }),
    );

    expect(mocks.onChangeInicial).toHaveBeenCalledOnce();
    expect(mocks.onChangeInicial).toHaveBeenCalledWith("2026-01-10");
  });

  it("deve encaminhar a alteração da data final", () => {
    renderizarComponente();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alterar data final",
      }),
    );

    expect(mocks.onChangeFinal).toHaveBeenCalledOnce();
    expect(mocks.onChangeFinal).toHaveBeenCalledWith("2026-12-20");
  });

  it("deve marcar os campos como tocados ao fechar", () => {
    renderizarComponente();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fechar período",
      }),
    );

    expect(mocks.onBlurInicial).toHaveBeenCalledOnce();
    expect(mocks.onBlurFinal).toHaveBeenCalledOnce();
  });

  it("deve validar os dois campos ao fechar", async () => {
    renderizarComponente();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fechar período",
      }),
    );

    await waitFor(() => {
      expect(mocks.trigger).toHaveBeenCalledOnce();
      expect(mocks.trigger).toHaveBeenCalledWith([
        "periodo_inicial",
        "periodo_final",
      ]);
    });
  });

  it("deve registrar os dois campos no formulário", () => {
    renderizarComponente();

    expect(mocks.useController).toHaveBeenNthCalledWith(1, {
      name: "periodo_inicial",
      control: {},
    });

    expect(mocks.useController).toHaveBeenNthCalledWith(2, {
      name: "periodo_final",
      control: {},
    });
  });
});
