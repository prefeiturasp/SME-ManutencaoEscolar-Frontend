import type { ComponentProps, ReactNode } from "react";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LoteFiltros } from "@/features/lotes/components/LoteFiltros";

vi.mock("@/components/shared/DateRangeField/DateRangeField", () => ({
  DateRangeField: ({
    dataInicial,
    dataFinal,
    label,
    onMudarDataInicial,
    onMudarDataFinal,
  }: {
    dataInicial: string;
    dataFinal: string;
    label: string;
    onMudarDataInicial: (value: string) => void;
    onMudarDataFinal: (value: string) => void;
  }) => (
    <div>
      <span>{label}</span>
      <span>{dataInicial || "Data inicial vazia"}</span>
      <span>{dataFinal || "Data final vazia"}</span>
      <button type="button" onClick={() => onMudarDataInicial("2026-01-10")}>
        Alterar data inicial
      </button>
      <button type="button" onClick={() => onMudarDataFinal("2026-12-20")}>
        Alterar data final
      </button>
    </div>
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
    <div data-open={String(open)} data-testid="popover">
      <button type="button" onClick={() => onOpenChange(!open)}>
        Alternar popover
      </button>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  PopoverContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/command", () => ({
  Command: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CommandEmpty: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  CommandGroup: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  CommandInput: ({ placeholder }: { placeholder?: string }) => (
    <input aria-label={placeholder} placeholder={placeholder} />
  ),
  CommandItem: ({
    children,
    onSelect,
  }: {
    children: ReactNode;
    onSelect: () => void;
  }) => (
    <button type="button" onClick={onSelect}>
      {children}
    </button>
  ),
  CommandList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    onValueChange,
  }: {
    children: ReactNode;
    onValueChange: (value: string) => void;
  }) => (
    <div>
      <button type="button" onClick={() => onValueChange("ativo")}>
        Escolher status ativo
      </button>
      <button type="button" onClick={() => onValueChange("inativo")}>
        Escolher status inativo
      </button>
      <button type="button" onClick={() => onValueChange("invalido")}>
        Escolher status inválido
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
}));

type Propriedades = ComponentProps<typeof LoteFiltros>;

function criarPropriedades(
  sobrescritas: Partial<Propriedades> = {},
): Propriedades {
  return {
    codigoCadastro: "",
    nome: "",
    status: "" as Propriedades["status"],
    empresa: "",
    diretoriasRegionais: [],
    periodoInicial: "",
    periodoFinal: "",
    opcoesEmpresas: [
      { value: "1", label: "Empresa Alpha" },
      { value: "2", label: "Empresa Beta" },
    ],
    opcoesDiretoriasRegionais: [
      { value: "1", label: "DRE Centro" },
      { value: "2", label: "DRE Norte" },
    ],
    onMudarCodigoCadastro: vi.fn<(value: string) => void>(),
    onMudarNome: vi.fn<(value: string) => void>(),
    onMudarStatus: vi.fn<(value: Propriedades["status"]) => void>(),
    onMudarEmpresa: vi.fn<(value: string) => void>(),
    onMudarDiretoriasRegionais: vi.fn<(values: string[]) => void>(),
    onMudarPeriodoInicial: vi.fn<(value: string) => void>(),
    onMudarPeriodoFinal: vi.fn<(value: string) => void>(),
    onBuscar: vi.fn<() => void>(),
    onLimpar: vi.fn<() => void>(),
    ...sobrescritas,
  };
}

describe("LoteFiltros", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("deve renderizar os campos e valores iniciais", () => {
    render(
      <LoteFiltros
        {...criarPropriedades({
          codigoCadastro: "LOTE-001",
          nome: "Lote Centro",
          periodoInicial: "2026-01-01",
          periodoFinal: "2026-12-31",
        })}
      />,
    );

    expect(screen.getByLabelText("Código de cadastro")).toHaveValue("LOTE-001");
    expect(screen.getByLabelText("Nome")).toHaveValue("Lote Centro");
    expect(screen.getByText("2026-01-01")).toBeInTheDocument();
    expect(screen.getByText("2026-12-31")).toBeInTheDocument();
    expect(
      screen.getByText("Selecione uma ou mais opções"),
    ).toBeInTheDocument();
    expect(screen.getByText("Digite o nome da empresa...")).toBeInTheDocument();
  });

  it("deve informar alterações no código e no nome", async () => {
    const user = userEvent.setup();
    const propriedades = criarPropriedades();
    render(<LoteFiltros {...propriedades} />);

    await user.type(screen.getByLabelText("Código de cadastro"), "ABC");
    await user.type(screen.getByLabelText("Nome"), "Lote");

    expect(propriedades.onMudarCodigoCadastro).toHaveBeenCalled();
    expect(propriedades.onMudarCodigoCadastro).toHaveBeenLastCalledWith("C");
    expect(propriedades.onMudarNome).toHaveBeenCalled();
    expect(propriedades.onMudarNome).toHaveBeenLastCalledWith("e");
  });

  it("deve exibir e remover uma Diretoria Regional selecionada", async () => {
    const user = userEvent.setup();
    const propriedades = criarPropriedades({ diretoriasRegionais: ["1"] });
    render(<LoteFiltros {...propriedades} />);

    expect(screen.getAllByText("DRE Centro")).toHaveLength(2);

    await user.click(
      screen.getByRole("button", { name: "Remover DRE Centro" }),
    );

    expect(propriedades.onMudarDiretoriasRegionais).toHaveBeenCalledWith([]);
  });

  it("deve adicionar uma Diretoria Regional não selecionada", async () => {
    const user = userEvent.setup();
    const propriedades = criarPropriedades({ diretoriasRegionais: ["1"] });
    render(<LoteFiltros {...propriedades} />);

    await user.click(screen.getByRole("button", { name: "DRE Norte" }));

    expect(propriedades.onMudarDiretoriasRegionais).toHaveBeenCalledWith([
      "1",
      "2",
    ]);
  });

  it("deve remover uma Diretoria Regional pela lista", async () => {
    const user = userEvent.setup();
    const propriedades = criarPropriedades({ diretoriasRegionais: ["1"] });
    render(<LoteFiltros {...propriedades} />);

    await user.click(screen.getByRole("button", { name: "DRE Centro" }));

    expect(propriedades.onMudarDiretoriasRegionais).toHaveBeenCalledWith([]);
  });

  it("deve abrir e fechar o seletor de DRE", async () => {
    const user = userEvent.setup();
    render(<LoteFiltros {...criarPropriedades()} />);
    const popoverDre = screen.getAllByTestId("popover")[0];
    const alternarDre = screen.getAllByRole("button", {
      name: "Alternar popover",
    })[0];

    expect(popoverDre).toHaveAttribute("data-open", "false");
    await user.click(alternarDre);
    expect(popoverDre).toHaveAttribute("data-open", "true");
    await user.click(alternarDre);
    expect(popoverDre).toHaveAttribute("data-open", "false");
  });

  it("deve aceitar somente os status permitidos", async () => {
    const user = userEvent.setup();
    const propriedades = criarPropriedades();
    render(<LoteFiltros {...propriedades} />);

    await user.click(
      screen.getByRole("button", { name: "Escolher status ativo" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Escolher status inativo" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Escolher status inválido" }),
    );

    expect(propriedades.onMudarStatus).toHaveBeenNthCalledWith(1, "ativo");
    expect(propriedades.onMudarStatus).toHaveBeenNthCalledWith(2, "inativo");
    expect(propriedades.onMudarStatus).toHaveBeenCalledTimes(2);
  });

  it("deve exibir a empresa selecionada", () => {
    render(<LoteFiltros {...criarPropriedades({ empresa: "1" })} />);

    expect(screen.getAllByText("Empresa Alpha").length).toBeGreaterThan(0);
  });

  it("deve selecionar uma empresa e fechar o seletor", async () => {
    const user = userEvent.setup();
    const propriedades = criarPropriedades();
    render(<LoteFiltros {...propriedades} />);
    const popoverEmpresa = screen.getAllByTestId("popover")[1];
    const alternarEmpresa = screen.getAllByRole("button", {
      name: "Alternar popover",
    })[1];

    await user.click(alternarEmpresa);
    expect(popoverEmpresa).toHaveAttribute("data-open", "true");

    await user.click(screen.getByRole("button", { name: "Empresa Beta" }));

    expect(propriedades.onMudarEmpresa).toHaveBeenCalledWith("2");
    expect(popoverEmpresa).toHaveAttribute("data-open", "false");
  });

  it("deve encaminhar as alterações do período", async () => {
    const user = userEvent.setup();
    const propriedades = criarPropriedades();
    render(<LoteFiltros {...propriedades} />);

    await user.click(
      screen.getByRole("button", { name: "Alterar data inicial" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Alterar data final" }),
    );

    expect(propriedades.onMudarPeriodoInicial).toHaveBeenCalledWith(
      "2026-01-10",
    );
    expect(propriedades.onMudarPeriodoFinal).toHaveBeenCalledWith("2026-12-20");
  });

  it("deve executar a busca e a limpeza dos filtros", async () => {
    const user = userEvent.setup();
    const propriedades = criarPropriedades();
    render(<LoteFiltros {...propriedades} />);

    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
    await user.click(screen.getByRole("button", { name: "Buscar lotes" }));

    expect(propriedades.onLimpar).toHaveBeenCalledOnce();
    expect(propriedades.onBuscar).toHaveBeenCalledOnce();
  });
});
