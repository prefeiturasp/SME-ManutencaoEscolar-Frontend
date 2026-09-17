import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { FiltrosCargo } from "@/features/cargo/components/FiltrosCargo";

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children: ReactNode;
  }) => (
    <div>
      <select
        aria-label="Exige documento?"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      >
        <option value="">Selecione</option>
        {children}
      </select>

      <button type="button" onClick={() => onValueChange("invalido")}>
        Enviar opção inválida
      </button>
    </div>
  ),

  SelectTrigger: () => null,
  SelectValue: () => null,

  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,

  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

function criarProps(
  alteracoes: Partial<ComponentProps<typeof FiltrosCargo>> = {},
): ComponentProps<typeof FiltrosCargo> {
  return {
    nome: "",
    exige_documento: "",
    cargos: [],
    onMudarNome: vi.fn(),
    onMudarExigeDocumento: vi.fn(),
    onBuscar: vi.fn(),
    onLimpar: vi.fn(),
    ...alteracoes,
  };
}

describe("FiltrosCargo", () => {
  it("exibe os valores recebidos nos filtros", () => {
    const props = criarProps({
      nome: "Engenheiro",
      exige_documento: "sim",
    });

    render(<FiltrosCargo {...props} />);

    expect(screen.getByLabelText("Nome")).toHaveValue("Engenheiro");
    expect(screen.getByLabelText("Exige documento?")).toHaveValue("sim");
  });

  it("chama onMudarNome ao digitar", () => {
    const props = criarProps();

    render(<FiltrosCargo {...props} />);

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Arquiteto" },
    });

    expect(props.onMudarNome).toHaveBeenCalledExactlyOnceWith("Arquiteto");
  });

  it("chama onMudarExigeDocumento ao selecionar Sim", () => {
    const props = criarProps();

    render(<FiltrosCargo {...props} />);

    fireEvent.change(screen.getByLabelText("Exige documento?"), {
      target: { value: "sim" },
    });

    expect(props.onMudarExigeDocumento).toHaveBeenCalledExactlyOnceWith("sim");
  });

  it("chama onMudarExigeDocumento ao selecionar Não", () => {
    const props = criarProps();

    render(<FiltrosCargo {...props} />);

    fireEvent.change(screen.getByLabelText("Exige documento?"), {
      target: { value: "nao" },
    });

    expect(props.onMudarExigeDocumento).toHaveBeenCalledExactlyOnceWith("nao");
  });

  it("ignora valores diferentes de sim e nao", () => {
    const props = criarProps();

    render(<FiltrosCargo {...props} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enviar opção inválida",
      }),
    );

    expect(props.onMudarExigeDocumento).not.toHaveBeenCalled();
  });

  it("chama onBuscar ao clicar em Buscar cargos", () => {
    const props = criarProps();

    render(<FiltrosCargo {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Buscar cargos" }));

    expect(props.onBuscar).toHaveBeenCalledOnce();
  });

  it("chama onLimpar ao clicar em Limpar filtros", () => {
    const props = criarProps();

    render(<FiltrosCargo {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));

    expect(props.onLimpar).toHaveBeenCalledOnce();
  });
});
