import type { ComponentProps } from "react";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TabelaLote } from "@/features/lotes/components/TabelaLote";

type LoteMock = {
  id: number;
  status: boolean;
};

vi.mock("@/components/shared/TabelaDeDados/TabelaDeDados", () => ({
  TabelaDeDados: ({
    dados,
    colunas,
    obterChave,
    atualizando,
    classNameLinha,
  }: {
    dados: LoteMock[];
    colunas: unknown[];
    obterChave: (lote: LoteMock) => number;
    atualizando: boolean;
    classNameLinha: (lote: LoteMock) => string;
  }) => (
    <div
      data-testid="tabela-de-dados"
      data-atualizando={String(atualizando)}
      data-quantidade-colunas={String(colunas.length)}
    >
      {dados.map((lote) => (
        <div
          key={obterChave(lote)}
          data-testid={`linha-${obterChave(lote)}`}
          className={classNameLinha(lote)}
        >
          Lote {lote.id}
        </div>
      ))}
    </div>
  ),
}));

type Propriedades = ComponentProps<typeof TabelaLote>;

function criarPropriedades(
  sobrescritas: Partial<Propriedades> = {},
): Propriedades {
  return {
    lotes: [
      {
        id: 1,
        status: true,
      },
      {
        id: 2,
        status: false,
      },
    ] as unknown as Propriedades["lotes"],
    colunas: [] as unknown as Propriedades["colunas"],
    ...sobrescritas,
  };
}

describe("TabelaLote", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("deve encaminhar os lotes para a tabela", () => {
    render(<TabelaLote {...criarPropriedades()} />);

    expect(screen.getByText("Lote 1")).toBeInTheDocument();
    expect(screen.getByText("Lote 2")).toBeInTheDocument();
  });

  it("deve utilizar o identificador do lote como chave", () => {
    render(<TabelaLote {...criarPropriedades()} />);

    expect(screen.getByTestId("linha-1")).toBeInTheDocument();
    expect(screen.getByTestId("linha-2")).toBeInTheDocument();
  });

  it("não deve aplicar estilo de bloqueado ao lote ativo", () => {
    render(<TabelaLote {...criarPropriedades()} />);

    const linhaAtiva = screen.getByTestId("linha-1");

    expect(linhaAtiva).not.toHaveClass("bg-background");
    expect(linhaAtiva).not.toHaveClass("text-blocked-foreground");
  });

  it("deve aplicar estilo de bloqueado ao lote inativo", () => {
    render(<TabelaLote {...criarPropriedades()} />);

    const linhaInativa = screen.getByTestId("linha-2");

    expect(linhaInativa).toHaveClass("bg-background");
    expect(linhaInativa).toHaveClass("text-blocked-foreground");
  });

  it("deve utilizar atualizando como falso por padrão", () => {
    render(<TabelaLote {...criarPropriedades()} />);

    expect(screen.getByTestId("tabela-de-dados")).toHaveAttribute(
      "data-atualizando",
      "false",
    );
  });

  it("deve encaminhar o estado de atualização", () => {
    render(
      <TabelaLote
        {...criarPropriedades({
          atualizando: true,
        })}
      />,
    );

    expect(screen.getByTestId("tabela-de-dados")).toHaveAttribute(
      "data-atualizando",
      "true",
    );
  });

  it("deve encaminhar as colunas para a tabela", () => {
    const colunas = [
      {
        id: "nome",
        titulo: "Nome",
      },
      {
        id: "status",
        titulo: "Status",
      },
    ] as unknown as Propriedades["colunas"];

    render(
      <TabelaLote
        {...criarPropriedades({
          colunas,
        })}
      />,
    );

    expect(screen.getByTestId("tabela-de-dados")).toHaveAttribute(
      "data-quantidade-colunas",
      "2",
    );
  });

  it("deve aceitar uma lista vazia de lotes", () => {
    render(
      <TabelaLote
        {...criarPropriedades({
          lotes: [],
        })}
      />,
    );

    expect(screen.queryByText(/Lote \d+/)).not.toBeInTheDocument();
    expect(screen.getByTestId("tabela-de-dados")).toBeInTheDocument();
  });
});
