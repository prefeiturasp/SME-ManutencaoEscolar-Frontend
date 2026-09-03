import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { criarColunasLote } from "@/features/lotes/components/ColunasLote";
import type { Lote } from "@/features/lotes/types/lotes.types";

const mocks = vi.hoisted(() => ({
  calcularDiasParaVencimento: vi.fn(),
  deveExibirAvisoVencimento: vi.fn(),
}));

vi.mock("@/utils/vencimentoLote", () => ({
  calcularDiasParaVencimento: mocks.calcularDiasParaVencimento,
  deveExibirAvisoVencimento: mocks.deveExibirAvisoVencimento,
}));

vi.mock("@/components/icons/Close", () => ({
  ErrorCircleIcon: ({ className }: { className?: string }) => (
    <span data-testid="icone-status-inativo" className={className} />
  ),
}));

vi.mock("@/components/icons/PincelCustom", () => ({
  PencilIcon: ({ className }: { className?: string }) => (
    <span data-testid="icone-editar" className={className} />
  ),
}));

vi.mock("@/components/icons/SimboloAprovado", () => ({
  SuccessCircleIcon: ({ className }: { className?: string }) => (
    <span data-testid="icone-status-ativo" className={className} />
  ),
}));

vi.mock("@/components/icons/WarningCircleIcon", () => ({
  WarningCircleIcon: ({ className }: { className?: string }) => (
    <span data-testid="icone-aviso-vencimento" className={className} />
  ),
}));

type ComponenteComFilhosProps = {
  children?: ReactNode;
};

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: ComponenteComFilhosProps) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),

  Tooltip: ({ children }: ComponenteComFilhosProps) => (
    <div data-testid="tooltip">{children}</div>
  ),

  TooltipTrigger: ({
    children,
  }: ComponenteComFilhosProps & {
    asChild?: boolean;
  }) => <div data-testid="tooltip-trigger">{children}</div>,

  TooltipContent: ({
    children,
  }: ComponenteComFilhosProps & {
    side?: string;
    align?: string;
    sideOffset?: number;
    className?: string;
  }) => <div data-testid="tooltip-content">{children}</div>,
}));

type MockButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
  size?: string;
  asChild?: boolean;
};

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: MockButtonProps) => (
    <button {...props}>{children}</button>
  ),
}));

const onEditar = vi.fn();

function criarLote(sobrescritas: Partial<Lote> = {}): Lote {
  return {
    id: 1,
    uuid: "lote-uuid-1",
    codigo_cadastro: "LOTE-001",
    nome: "Lote de manutenção",
    status: true,
    empresa: {
      id: 1,
      uuid: "empresa-uuid-1",
      nome: "Empresa XPTO",
    },
    diretorias_regionais: [
      {
        id: 1,
        nome: "Diretoria Regional Butantã",
        nome_curto: "DRE BT",
      },
    ],
    periodo_inicial: "2026-07-28",
    periodo_final: "2026-10-16",
    ...sobrescritas,
  } as unknown as Lote;
}

function obterColuna(id: string) {
  const colunas = criarColunasLote({
    onEditar,
  });

  const coluna = colunas.find((colunaItem) => colunaItem.id === id);

  if (!coluna) {
    throw new Error(`Coluna "${id}" não encontrada.`);
  }

  return coluna;
}

function obterClasseCelula(id: string, lote: Lote): string | undefined {
  const coluna = obterColuna(id);

  return typeof coluna.classNameCelula === "function"
    ? coluna.classNameCelula(lote)
    : coluna.classNameCelula;
}

describe("criarColunasLote", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.calcularDiasParaVencimento.mockReturnValue(40);

    mocks.deveExibirAvisoVencimento.mockReturnValue(true);
  });

  it("deve criar todas as colunas da tabela", () => {
    const colunas = criarColunasLote({
      onEditar,
    });

    expect(colunas.map((coluna) => coluna.id)).toEqual([
      "codigo_cadastro",
      "nome",
      "diretorias_regionais",
      "status",
      "empresa",
      "periodo",
      "acoes",
    ]);

    expect(obterColuna("codigo_cadastro").titulo).toBe("Código de cadastro");

    expect(obterColuna("nome").titulo).toBe("Nome do lote");

    expect(obterColuna("diretorias_regionais").titulo).toBe("DREs");

    expect(obterColuna("status").titulo).toBe("Status");

    expect(obterColuna("empresa").titulo).toBe("Empresa");

    expect(obterColuna("periodo").titulo).toBe("Período da\nlicitação");

    expect(obterColuna("acoes").tituloAcessivel).toBe("Ações");
  });

  it("deve aplicar classes de lote ativo", () => {
    const lote = criarLote({
      status: true,
    });

    expect(obterClasseCelula("codigo_cadastro", lote)).toContain("text-gray");

    expect(obterClasseCelula("nome", lote)).toContain("text-gray");

    expect(obterClasseCelula("diretorias_regionais", lote)).toContain(
      "text-gray",
    );

    expect(obterClasseCelula("status", lote)).toContain("text-gray");

    expect(obterClasseCelula("empresa", lote)).toContain("text-gray");

    expect(obterClasseCelula("periodo", lote)).toContain("text-gray");
  });

  it("deve aplicar classes de lote inativo", () => {
    const lote = criarLote({
      status: false,
    });

    expect(obterClasseCelula("codigo_cadastro", lote)).toContain(
      "text-blocked-foreground",
    );

    expect(obterClasseCelula("nome", lote)).toContain(
      "text-blocked-foreground",
    );

    expect(obterClasseCelula("diretorias_regionais", lote)).toContain(
      "text-blocked-foreground",
    );

    expect(obterClasseCelula("status", lote)).toContain(
      "text-blocked-foreground",
    );

    expect(obterClasseCelula("empresa", lote)).toContain(
      "text-blocked-foreground",
    );

    expect(obterClasseCelula("periodo", lote)).toContain(
      "text-blocked-foreground",
    );
  });

  it("deve renderizar código, nome e empresa", () => {
    const lote = criarLote();

    render(
      <div>
        <span data-testid="codigo">
          {obterColuna("codigo_cadastro").renderizar(lote)}
        </span>

        <span data-testid="nome">{obterColuna("nome").renderizar(lote)}</span>

        <span data-testid="empresa">
          {obterColuna("empresa").renderizar(lote)}
        </span>
      </div>,
    );

    expect(screen.getByTestId("codigo")).toHaveTextContent("LOTE-001");

    expect(screen.getByTestId("nome")).toHaveTextContent("Lote de manutenção");

    expect(screen.getByTestId("empresa")).toHaveTextContent("Empresa XPTO");
  });

  it("deve usar hífen quando código, nome e empresa não existirem", () => {
    const lote = criarLote({
      codigo_cadastro: null,
      nome: null,
      empresa: null,
    } as unknown as Partial<Lote>);

    render(
      <div>
        <span data-testid="codigo">
          {obterColuna("codigo_cadastro").renderizar(lote)}
        </span>

        <span data-testid="nome">{obterColuna("nome").renderizar(lote)}</span>

        <span data-testid="empresa">
          {obterColuna("empresa").renderizar(lote)}
        </span>
      </div>,
    );

    expect(screen.getByTestId("codigo")).toHaveTextContent("-");

    expect(screen.getByTestId("nome")).toHaveTextContent("-");

    expect(screen.getByTestId("empresa")).toHaveTextContent("-");
  });

  it("deve renderizar DRE com nome curto e nome completo", () => {
    const lote = criarLote({
      diretorias_regionais: [
        {
          id: 1,
          nome: "Diretoria Butantã",
          nome_curto: "DRE BT",
        },
        {
          id: 2,
          nome: "Diretoria Ipiranga",
          nome_curto: "",
        },
      ],
      status: true,
    } as unknown as Partial<Lote>);

    render(<>{obterColuna("diretorias_regionais").renderizar(lote)}</>);

    const dreNomeCurto = screen.getByText("DRE BT");

    const dreNomeCompleto = screen.getByText("Diretoria Ipiranga");

    expect(dreNomeCurto).toBeInTheDocument();
    expect(dreNomeCompleto).toBeInTheDocument();

    expect(dreNomeCurto).toHaveClass("text-[var(--gray)]");

    expect(dreNomeCompleto).toHaveClass("text-[var(--gray)]");
  });

  it("deve aplicar estilo inativo nas DREs", () => {
    const lote = criarLote({
      status: false,
    });

    render(<>{obterColuna("diretorias_regionais").renderizar(lote)}</>);

    expect(screen.getByText("DRE BT")).toHaveClass("text-blocked-foreground");
  });

  it("deve exibir hífen quando não houver DREs", () => {
    const lote = criarLote({
      diretorias_regionais: [],
    });

    render(
      <span data-testid="dres">
        {obterColuna("diretorias_regionais").renderizar(lote)}
      </span>,
    );

    expect(screen.getByTestId("dres")).toHaveTextContent("-");
  });

  it("deve usar lista vazia quando diretorias forem indefinidas", () => {
    const lote = criarLote({
      diretorias_regionais: undefined,
    });

    render(
      <span data-testid="dres">
        {obterColuna("diretorias_regionais").renderizar(lote)}
      </span>,
    );

    expect(screen.getByTestId("dres")).toHaveTextContent("-");
  });

  it("deve renderizar status ativo", () => {
    const lote = criarLote({
      status: true,
    });

    render(<>{obterColuna("status").renderizar(lote)}</>);

    expect(screen.getByText("Ativo")).toBeInTheDocument();

    expect(screen.getByTestId("icone-status-ativo")).toBeInTheDocument();

    expect(
      screen.queryByTestId("icone-status-inativo"),
    ).not.toBeInTheDocument();
  });

  it("deve renderizar status inativo", () => {
    const lote = criarLote({
      status: false,
    });

    render(<>{obterColuna("status").renderizar(lote)}</>);

    expect(screen.getByText("Inativo")).toBeInTheDocument();

    expect(screen.getByTestId("icone-status-inativo")).toBeInTheDocument();

    expect(screen.queryByTestId("icone-status-ativo")).not.toBeInTheDocument();
  });

  it("deve exibir hífen quando as duas datas não existirem", () => {
    const lote = criarLote({
      periodo_inicial: null,
      periodo_final: null,
    });

    render(
      <span data-testid="periodo">
        {obterColuna("periodo").renderizar(lote)}
      </span>,
    );

    expect(screen.getByTestId("periodo")).toHaveTextContent("-");
  });

  it("deve formatar período sem apresentar aviso", () => {
    mocks.calcularDiasParaVencimento.mockReturnValue(null);

    mocks.deveExibirAvisoVencimento.mockReturnValue(false);

    const lote = criarLote();

    render(<>{obterColuna("periodo").renderizar(lote)}</>);

    expect(screen.getByText("28/07/2026 à")).toBeInTheDocument();

    expect(screen.getByText("16/10/2026")).toBeInTheDocument();

    expect(mocks.calcularDiasParaVencimento).toHaveBeenCalledWith("2026-10-16");

    expect(mocks.deveExibirAvisoVencimento).toHaveBeenCalledWith(null);

    expect(
      screen.queryByTestId("icone-aviso-vencimento"),
    ).not.toBeInTheDocument();
  });

  it("deve formatar período quando somente a data final existir", () => {
    mocks.deveExibirAvisoVencimento.mockReturnValue(false);

    const lote = criarLote({
      periodo_inicial: null,
      periodo_final: "2026-10-16",
    });

    render(<>{obterColuna("periodo").renderizar(lote)}</>);

    expect(screen.getByText("- à")).toBeInTheDocument();

    expect(screen.getByText("16/10/2026")).toBeInTheDocument();
  });

  it("não deve exibir aviso para lote inativo", () => {
    const lote = criarLote({
      status: false,
    });

    render(<>{obterColuna("periodo").renderizar(lote)}</>);

    expect(mocks.calcularDiasParaVencimento).toHaveBeenCalledWith("2026-10-16");

    expect(mocks.deveExibirAvisoVencimento).not.toHaveBeenCalled();

    expect(
      screen.queryByTestId("icone-aviso-vencimento"),
    ).not.toBeInTheDocument();
  });

  it("não deve exibir aviso quando estiver fora do período definido", () => {
    mocks.calcularDiasParaVencimento.mockReturnValue(100);

    mocks.deveExibirAvisoVencimento.mockReturnValue(false);

    const lote = criarLote({
      status: true,
    });

    render(<>{obterColuna("periodo").renderizar(lote)}</>);

    expect(mocks.deveExibirAvisoVencimento).toHaveBeenCalledWith(100);

    expect(
      screen.queryByTestId("icone-aviso-vencimento"),
    ).not.toBeInTheDocument();
  });

  it("deve informar quando a licitação vence hoje", () => {
    mocks.calcularDiasParaVencimento.mockReturnValue(0);

    mocks.deveExibirAvisoVencimento.mockReturnValue(true);

    const lote = criarLote();

    render(<>{obterColuna("periodo").renderizar(lote)}</>);

    expect(
      screen.getByRole("button", {
        name: "A licitação vence hoje.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("icone-aviso-vencimento")).toBeInTheDocument();

    expect(screen.getByTestId("tooltip-content")).toHaveTextContent(
      "A licitação vence hoje.",
    );
  });

  it("deve informar quando falta um dia", () => {
    mocks.calcularDiasParaVencimento.mockReturnValue(1);

    mocks.deveExibirAvisoVencimento.mockReturnValue(true);

    const lote = criarLote();

    render(<>{obterColuna("periodo").renderizar(lote)}</>);

    expect(
      screen.getByRole("button", {
        name: /Falta 1 dia para o\s+vencimento da licitação/,
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("tooltip-content")).toHaveTextContent(
      "Falta 1 dia para o vencimento da licitação.",
    );
  });

  it("deve informar quantos dias faltam", () => {
    mocks.calcularDiasParaVencimento.mockReturnValue(40);

    mocks.deveExibirAvisoVencimento.mockReturnValue(true);

    const lote = criarLote();

    render(<>{obterColuna("periodo").renderizar(lote)}</>);

    expect(
      screen.getByRole("button", {
        name: /Faltam 40 dias para o\s+vencimento da licitação/,
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("tooltip-content")).toHaveTextContent(
      "Faltam 40 dias para o vencimento da licitação.",
    );
  });

  it("deve editar um lote com nome", async () => {
    const user = userEvent.setup();
    const lote = criarLote();

    render(<>{obterColuna("acoes").renderizar(lote)}</>);

    const botaoEditar = screen.getByRole("button", {
      name: "Editar Lote de manutenção",
    });

    expect(screen.getByTestId("icone-editar")).toBeInTheDocument();

    await user.click(botaoEditar);

    expect(onEditar).toHaveBeenCalledWith(lote);
  });

  it("deve usar nome padrão no botão quando lote não tiver nome", async () => {
    const user = userEvent.setup();

    const lote = criarLote({
      nome: undefined,
    });

    render(<>{obterColuna("acoes").renderizar(lote)}</>);

    const botaoEditar = screen.getByRole("button", {
      name: "Editar lote",
    });

    await user.click(botaoEditar);

    expect(onEditar).toHaveBeenCalledWith(lote);
  });
});
