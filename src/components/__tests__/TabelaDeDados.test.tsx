import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTable } from "@/components/shared/TabelaDeDados";
import type { ColunaTabela } from "@/components/shared/types/TabelaDeDados.type";

type Item = { id: number; nome: string };

const ITENS: Item[] = [
  { id: 1, nome: "Item 1" },
  { id: 2, nome: "Item 2" },
];

const COLUNAS: ColunaTabela<Item>[] = [
  {
    id: "nome",
    titulo: "Nome",
    renderizar: (item) => item.nome,
  },
  {
    id: "acoes",
    tituloAcessivel: "Ações",
    renderizar: () => null,
  },
];

describe("DataTable", () => {
  it("deve renderizar os cabeçalhos e as linhas com base nas colunas informadas", () => {
    render(
      <DataTable dados={ITENS} colunas={COLUNAS} obterChave={(item) => item.id} />,
    );

    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("Ações")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("deve aplicar uma classe de linha estática quando classNameLinha não for uma função", () => {
    render(
      <DataTable
        dados={ITENS}
        colunas={COLUNAS}
        obterChave={(item) => item.id}
        classNameLinha="linha-estatica"
      />,
    );

    expect(screen.getByText("Item 1").closest("tr")).toHaveClass(
      "linha-estatica",
    );
  });

  it("não deve possuir classe de linha quando classNameLinha não for informado", () => {
    render(
      <DataTable dados={ITENS} colunas={COLUNAS} obterChave={(item) => item.id} />,
    );

    expect(screen.getByText("Item 1").closest("tr")).not.toHaveAttribute(
      "class",
    );
  });

  it("deve marcar a tabela como ocupada quando atualizando for verdadeiro", () => {
    render(
      <DataTable
        dados={ITENS}
        colunas={COLUNAS}
        obterChave={(item) => item.id}
        atualizando
      />,
    );

    expect(screen.getByRole("table").parentElement).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });
});
