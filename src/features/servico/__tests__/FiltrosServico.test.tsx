import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { FiltrosServico } from "@/features/servico/components/Servico/FiltrosServico";
import type { FiltrosServicoProps } from "@/features/servico/types/servicos.types";

vi.mock("lucide-react", () => ({
  Search: ({ className }: { className?: string }) => (
    <span data-testid="icone-buscar" className={className}>
      🔍
    </span>
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: ReactNode;
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <div data-testid="select-status" data-value={value}>
      <button type="button" onClick={() => onValueChange("ativo")}>
        Selecionar ativo
      </button>

      <button type="button" onClick={() => onValueChange("inativo")}>
        Selecionar inativo
      </button>

      <button type="button" onClick={() => onValueChange("valor-invalido")}>
        Selecionar valor inválido
      </button>

      {children}
    </div>
  ),

  SelectTrigger: ({
    children,
    id,
    className,
  }: {
    children: ReactNode;
    id?: string;
    className?: string;
  }) => (
    <div id={id} className={className}>
      {children}
    </div>
  ),

  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),

  SelectContent: ({
    children,
  }: {
    children: ReactNode;
    position?: string;
    align?: string;
    sideOffset?: number;
  }) => <div>{children}</div>,

  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <span data-value={value}>{children}</span>
  ),
}));

function criarProps(
  sobrescritas: Partial<FiltrosServicoProps> = {},
): FiltrosServicoProps {
  return {
    nome: "",
    status: "",
    onMudarNome: vi.fn(),
    onMudarStatus: vi.fn(),
    onBuscar: vi.fn(),
    onLimpar: vi.fn(),
    servicos: [],
    ...sobrescritas,
  };
}

describe("FiltrosServico", () => {
  it("deve renderizar os campos e botões", () => {
    const props = criarProps();

    render(<FiltrosServico {...props} />);

    expect(screen.getByLabelText("Nome")).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Digite o nome do serviço..."),
    ).toBeInTheDocument();

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Selecione")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText("Inativo")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Limpar filtros" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Buscar serviços/i }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("icone-buscar")).toBeInTheDocument();
  });

  it("deve exibir o valor recebido no campo nome e no status", () => {
    const props = criarProps({
      nome: "Elétrica",
      status: "ativo",
    });

    render(<FiltrosServico {...props} />);

    expect(screen.getByLabelText("Nome")).toHaveValue("Elétrica");

    expect(screen.getByTestId("select-status")).toHaveAttribute(
      "data-value",
      "ativo",
    );
  });

  it("deve chamar onMudarNome quando o nome for alterado", () => {
    const onMudarNome = vi.fn();

    const props = criarProps({
      onMudarNome,
    });

    render(<FiltrosServico {...props} />);

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: {
        value: "Pintura",
      },
    });

    expect(onMudarNome).toHaveBeenCalledTimes(1);
    expect(onMudarNome).toHaveBeenCalledWith("Pintura");
  });

  it("deve chamar onMudarStatus ao selecionar ativo", () => {
    const onMudarStatus = vi.fn();

    const props = criarProps({
      onMudarStatus,
    });

    render(<FiltrosServico {...props} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar ativo",
      }),
    );

    expect(onMudarStatus).toHaveBeenCalledTimes(1);
    expect(onMudarStatus).toHaveBeenCalledWith("ativo");
  });

  it("deve chamar onMudarStatus ao selecionar inativo", () => {
    const onMudarStatus = vi.fn();

    const props = criarProps({
      onMudarStatus,
    });

    render(<FiltrosServico {...props} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar inativo",
      }),
    );

    expect(onMudarStatus).toHaveBeenCalledTimes(1);
    expect(onMudarStatus).toHaveBeenCalledWith("inativo");
  });

  it("não deve chamar onMudarStatus para um valor inválido", () => {
    const onMudarStatus = vi.fn();

    const props = criarProps({
      onMudarStatus,
    });

    render(<FiltrosServico {...props} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar valor inválido",
      }),
    );

    expect(onMudarStatus).not.toHaveBeenCalled();
  });

  it("deve desabilitar a busca quando não houver filtros", () => {
    const onBuscar = vi.fn();
    const props = criarProps({ onBuscar });

    render(<FiltrosServico {...props} />);

    const botaoBuscar = screen.getByRole("button", {
      name: /Buscar serviços/i,
    });

    expect(botaoBuscar).toBeDisabled();

    expect(botaoBuscar).toHaveClass(
      "max-w-[165px]",
      "border-blocked-foreground",
      "text-blocked-foreground",
    );

    fireEvent.click(botaoBuscar);

    expect(onBuscar).not.toHaveBeenCalled();
  });

  it("deve desabilitar a busca quando o nome possuir apenas espaços", () => {
    const props = criarProps({
      nome: "   ",
    });

    render(<FiltrosServico {...props} />);

    expect(
      screen.getByRole("button", {
        name: /Buscar serviços/i,
      }),
    ).toBeDisabled();
  });

  it("deve habilitar a busca quando houver nome preenchido", () => {
    const onBuscar = vi.fn();

    const props = criarProps({
      nome: "  Elétrica  ",
      onBuscar,
    });

    render(<FiltrosServico {...props} />);

    const botaoBuscar = screen.getByRole("button", {
      name: /Buscar serviços/i,
    });

    expect(botaoBuscar).toBeEnabled();
    expect(botaoBuscar).toHaveClass("max-w-[165px]");

    expect(botaoBuscar).not.toHaveClass("border-blocked-foreground");

    fireEvent.click(botaoBuscar);

    expect(onBuscar).toHaveBeenCalledTimes(1);
  });

  it("deve habilitar a busca quando houver status selecionado", () => {
    const onBuscar = vi.fn();

    const props = criarProps({
      nome: "   ",
      status: "inativo",
      onBuscar,
    });

    render(<FiltrosServico {...props} />);

    const botaoBuscar = screen.getByRole("button", {
      name: /Buscar serviços/i,
    });

    expect(botaoBuscar).toBeEnabled();

    fireEvent.click(botaoBuscar);

    expect(onBuscar).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onLimpar quando houver filtros", () => {
    const onLimpar = vi.fn();

    const props = criarProps({
      nome: "Pintura",
      onLimpar,
    });

    render(<FiltrosServico {...props} />);

    const botaoLimpar = screen.getByRole("button", {
      name: "Limpar filtros",
    });

    expect(botaoLimpar).toBeEnabled();

    fireEvent.click(botaoLimpar);

    expect(onLimpar).toHaveBeenCalledTimes(1);
  });

  it("deve desabilitar o botão limpar quando não houver filtros", () => {
    const onLimpar = vi.fn();

    const props = criarProps({
      nome: "",
      status: "",
      servicos: [
        {
          id: 1,
          uuid: "uuid-pintura",
          nome: "Pintura",
          status: true,
        },
      ],
      onLimpar,
    });

    render(<FiltrosServico {...props} />);

    const botaoLimpar = screen.getByRole("button", {
      name: "Limpar filtros",
    });

    expect(botaoLimpar).toBeDisabled();

    expect(botaoLimpar).toHaveClass(
      "max-w-[117px]",
      "border-blocked-foreground",
      "text-blocked-foreground",
    );

    fireEvent.click(botaoLimpar);

    expect(onLimpar).not.toHaveBeenCalled();
  });

  it("deve habilitar o botão limpar quando houver filtro de status", () => {
    const props = criarProps({
      nome: "",
      status: "ativo",
    });

    render(<FiltrosServico {...props} />);

    expect(
      screen.getByRole("button", {
        name: "Limpar filtros",
      }),
    ).toBeEnabled();
  });
});
