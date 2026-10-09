import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { criarColunasEquipe } from "../components/list/ColunasEquipe";
import { TabelaEquipe } from "../components/list/TabelaEquipe";
import type { Equipe } from "../types/equipe.types";

function criarEquipe(dados: Partial<Equipe> = {}): Equipe {
  return {
    id: 1,
    uuid: "equipe-1",
    nome: "Equipe Norte",
    nome_empresa: "Empresa Norte",
    situacao: true,
    profissionais: [],
    lote: "lote-1",
    ...dados,
  };
}

describe("ColunasEquipe", () => {
  it.each([true, false])(
    "exibe os dados e as cores da equipe com situacao=%s e permite editar",
    (situacao) => {
      const equipe = criarEquipe({ situacao });
      const onEditar = vi.fn();
      render(<TabelaEquipe equipes={[equipe]} colunas={criarColunasEquipe({ onEditar })} />);
      const linha = screen.getByText("Equipe Norte").closest("tr")!;
      expect(screen.getByText("Empresa Norte")).toBeInTheDocument();
      expect(screen.getByText(situacao ? "Ativo" : "Inativo")).toBeInTheDocument();
      for (const celula of within(linha).getAllByRole("cell").slice(0, 4)) {
        expect(celula).toHaveClass(situacao ? "text-gray" : "text-blocked-foreground");
      }
      expect(screen.getByText(situacao ? "Ativo" : "Inativo").querySelector("svg")).toHaveClass(
        situacao ? "text-[#8DC773]" : "text-[#FD756D]",
      );
      fireEvent.click(screen.getByRole("button", { name: "Editar Equipe Norte" }));
      expect(onEditar).toHaveBeenCalledExactlyOnceWith(equipe);
    },
  );

  it.each([
    {
      lote: {
        id: 1,
        nome: "Lote Norte",
        codigo_cadastro: "001",
        periodo_inicial: "2026-01-01",
        periodo_final: "2026-12-31",
      },
      nome: "Lote Norte",
      periodo: "01/01/2026 à 31/12/2026",
    },
    {
      lote: { id: 1, codigo_cadastro: "001", periodo_inicial: "2026-01-01" },
      nome: "001",
      periodo: "01/01/2026 à -",
    },
    { lote: { id: 1, periodo_final: "2026-12-31" }, nome: "-", periodo: "- à 31/12/2026" },
    { lote: { id: 1 }, nome: "-", periodo: null },
    { lote: "lote-1", nome: "-", periodo: null },
  ])("renderiza o lote e as datas disponíveis: $nome, $periodo", ({ lote, nome, periodo }) => {
    const equipe = criarEquipe({ lote });
    const coluna = criarColunasEquipe({ onEditar: vi.fn() }).find((item) => item.id === "lote")!;
    const { container } = render(<div>{coluna.renderizar(equipe)}</div>);
    expect(screen.getByText(nome, { exact: true })).toBeInTheDocument();
    if (periodo) {
      expect(screen.getByText(periodo)).toBeInTheDocument();
    } else {
      expect(container).not.toHaveTextContent(" à ");
    }
  });
});
