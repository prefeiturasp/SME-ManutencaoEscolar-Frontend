import type { ReactElement, ReactNode } from "react";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
import { criarColunasLote } from "@/features/lotes/components/ColunasLote";
import type { Lote } from "@/features/lotes/types/lotes.types";

function criarLote(sobrescritas: Partial<Lote> = {}): Lote {
  return {
    codigo_cadastro: "LOTE-001",
    nome: "Lote Centro",
    status: true,
    diretorias_regionais: [],
    empresa: null,
    periodo_inicial: null,
    periodo_final: null,
    ...sobrescritas,
  } as unknown as Lote;
}

function obterColuna(
  colunas: ColunaTabela<Lote>[],
  id: string,
): ColunaTabela<Lote> {
  const coluna = colunas.find((item) => item.id === id);

  if (!coluna) {
    throw new Error(`Coluna ${id} não encontrada.`);
  }

  return coluna;
}

function obterConteudoColuna(
  colunas: ColunaTabela<Lote>[],
  id: string,
  lote: Lote,
): ReactNode {
  const coluna = obterColuna(colunas, id);

  if (!coluna.renderizar) {
    throw new Error(`Coluna ${id} não possui renderizador.`);
  }

  return coluna.renderizar(lote);
}

describe("criarColunasLote", () => {
  const onEditar = vi.fn<(lote: Lote) => void>();
  let colunas: ColunaTabela<Lote>[];

  beforeEach(() => {
    vi.clearAllMocks();
    colunas = criarColunasLote({ onEditar });
  });

  afterEach(() => {
    cleanup();
  });

  it("deve criar todas as colunas na ordem esperada", () => {
    expect(colunas.map((coluna) => coluna.id)).toEqual([
      "codigo_cadastro",
      "nome",
      "diretorias_regionais",
      "status",
      "empresa",
      "periodo",
      "acoes",
    ]);

    expect(colunas.map((coluna) => coluna.titulo)).toEqual([
      "Código de cadastro",
      "Nome do lote",
      "DREs",
      "Status",
      "Empresa",
      "Período da licitação",
      undefined,
    ]);

    expect(obterColuna(colunas, "acoes").tituloAcessivel).toBe("Ações");
  });

  it("deve aplicar as classes de lote ativo e inativo", () => {
    const loteAtivo = criarLote({ status: true });
    const loteInativo = criarLote({ status: false });

    colunas.forEach((coluna) => {
      if (typeof coluna.classNameCelula !== "function") {
        return;
      }

      expect(coluna.classNameCelula(loteAtivo)).toContain("text-gray");
      expect(coluna.classNameCelula(loteInativo)).toContain(
        "text-blocked-foreground",
      );
    });
  });

  it("deve renderizar código e nome do lote", () => {
    const lote = criarLote();

    expect(obterConteudoColuna(colunas, "codigo_cadastro", lote)).toBe(
      "LOTE-001",
    );
    expect(obterConteudoColuna(colunas, "nome", lote)).toBe("Lote Centro");
  });

  it("deve usar hífen quando código e nome não forem informados", () => {
    const lote = criarLote({
      codigo_cadastro: null,
      nome: null,
    } as unknown as Partial<Lote>);

    expect(obterConteudoColuna(colunas, "codigo_cadastro", lote)).toBe("-");
    expect(obterConteudoColuna(colunas, "nome", lote)).toBe("-");
  });

  it("deve usar hífen quando não houver Diretorias Regionais", () => {
    const semDiretorias = criarLote({ diretorias_regionais: [] });
    const diretoriasAusentes = criarLote({
      diretorias_regionais: undefined,
    });

    expect(
      obterConteudoColuna(colunas, "diretorias_regionais", semDiretorias),
    ).toBe("-");
    expect(
      obterConteudoColuna(colunas, "diretorias_regionais", diretoriasAusentes),
    ).toBe("-");
  });

  it("deve renderizar o nome curto ou o nome completo da DRE", () => {
    const lote = criarLote({
      diretorias_regionais: [
        {
          id: 1,
          nome: "DIRETORIA REGIONAL BUTANTA",
          nome_curto: "DRE BUTANTA",
        },
        {
          id: 2,
          nome: "dre sao-mateus",
          nome_curto: "",
        },
      ] as Lote["diretorias_regionais"],
    });

    render(<>{obterConteudoColuna(colunas, "diretorias_regionais", lote)}</>);

    expect(screen.getByText("DRE BUTANTA")).toBeInTheDocument();
    expect(screen.getByText("dre sao-mateus")).toBeInTheDocument();
  });

  it("deve aplicar a classe de texto inativo nas Diretorias Regionais", () => {
    const lote = criarLote({
      status: false,
      diretorias_regionais: [
        {
          id: 1,
          nome: "DRE CENTRO",
          nome_curto: "DRE CENTRO",
        },
      ] as Lote["diretorias_regionais"],
    });

    render(<>{obterConteudoColuna(colunas, "diretorias_regionais", lote)}</>);

    expect(screen.getByText("DRE CENTRO")).toHaveClass(
      "text-blocked-foreground",
    );
  });

  it("deve renderizar o status ativo", () => {
    render(
      <>
        {obterConteudoColuna(colunas, "status", criarLote({ status: true }))}
      </>,
    );

    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("deve renderizar o status inativo", () => {
    render(
      <>
        {obterConteudoColuna(colunas, "status", criarLote({ status: false }))}
      </>,
    );

    expect(screen.getByText("Inativo")).toBeInTheDocument();
  });

  it("deve renderizar o nome da empresa", () => {
    const lote = criarLote({
      empresa: {
        nome: "Empresa Teste",
      } as Lote["empresa"],
    });

    expect(obterConteudoColuna(colunas, "empresa", lote)).toBe("Empresa Teste");
  });

  it("deve usar hífen quando a empresa não estiver presente", () => {
    const lote = criarLote({ empresa: undefined });

    expect(obterConteudoColuna(colunas, "empresa", lote)).toBe("-");
  });

  it("deve usar hífen quando o período não estiver presente", () => {
    const lote = criarLote({
      periodo_inicial: null,
      periodo_final: null,
    });

    expect(obterConteudoColuna(colunas, "periodo", lote)).toBe("-");
  });

  it("deve renderizar o período completo formatado", () => {
    const lote = criarLote({
      periodo_inicial: "2026-01-10",
      periodo_final: "2026-12-20",
    });

    render(<>{obterConteudoColuna(colunas, "periodo", lote)}</>);

    expect(screen.getByText("10/01/2026 à")).toBeInTheDocument();
    expect(screen.getByText("20/12/2026")).toBeInTheDocument();
  });

  it("deve usar hífen para a data ausente em um período incompleto", () => {
    const somenteDataInicial = criarLote({
      periodo_inicial: "2026-01-10",
      periodo_final: null,
    });

    const { rerender } = render(
      <>{obterConteudoColuna(colunas, "periodo", somenteDataInicial)}</>,
    );

    expect(screen.getByText("10/01/2026 à")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();

    const somenteDataFinal = criarLote({
      periodo_inicial: null,
      periodo_final: "2026-12-20",
    });

    rerender(<>{obterConteudoColuna(colunas, "periodo", somenteDataFinal)}</>);

    expect(screen.getByText("- à")).toBeInTheDocument();
    expect(screen.getByText("20/12/2026")).toBeInTheDocument();
  });

  it("deve renderizar a ação de edição desabilitada", () => {
    const lote = criarLote();

    render(<>{obterConteudoColuna(colunas, "acoes", lote)}</>);

    expect(
      screen.getByRole("button", { name: "Editar Lote Centro" }),
    ).toBeDisabled();
  });

  it("deve usar nome padrão no rótulo da ação quando o nome estiver ausente", () => {
    const lote = criarLote({ nome: null } as unknown as Partial<Lote>);

    render(<>{obterConteudoColuna(colunas, "acoes", lote)}</>);

    expect(
      screen.getByRole("button", { name: "Editar lote" }),
    ).toBeInTheDocument();
  });

  it("deve encaminhar o lote ao callback de edição", () => {
    const lote = criarLote();
    const elemento = obterConteudoColuna(
      colunas,
      "acoes",
      lote,
    ) as ReactElement<{ onClick: () => void }>;

    elemento.props.onClick();

    expect(onEditar).toHaveBeenCalledOnce();
    expect(onEditar).toHaveBeenCalledWith(lote);
  });
});
