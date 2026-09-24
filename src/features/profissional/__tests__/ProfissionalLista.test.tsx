import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DataTableProps } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
import type { Profissional } from "@/features/profissional/types/profissional.types";
import { ProfissionalLista } from "../components/list/ProfissionalLista";

const mocks = vi.hoisted(() => ({
  useProfissionais: vi.fn(),
  criarColunas: vi.fn((_params: { onEditar: () => void }) => []),
  tabelaDeDados: vi.fn((_props: DataTableProps<Profissional>) => (
    <div aria-busy={_props.atualizando}>Tabela de profissionais</div>
  )),
  refetch: vi.fn(),
}));

vi.mock("../hooks/useProfissionais", () => ({ useProfissionais: mocks.useProfissionais }));
vi.mock("../components/list/ColunasProfissional", () => ({
  criarColunasProfissional: mocks.criarColunas,
}));
vi.mock("../components/list/ProfissionalFiltros", () => ({
  ProfissionalFiltros: ({
    onChange,
    onSearch,
    onClear,
  }: {
    onChange: (name: string, value: string) => void;
    onSearch: () => void;
    onClear: () => void;
  }) => (
    <div>
      <button onClick={() => onChange("nome", "  Maria  ")}>Alterar filtro</button>
      <button onClick={onSearch}>Buscar</button>
      <button onClick={onClear}>Limpar</button>
    </div>
  ),
}));
vi.mock("@/components/shared/TabelaDeDados/TabelaDeDados", () => ({
  TabelaDeDados: mocks.tabelaDeDados,
}));
vi.mock("@/components/navigation/paginacao/Paginacao", () => ({
  Paginacao: ({
    onMudarPagina,
    onMudarRegistrosPorPagina,
  }: {
    onMudarPagina: (page: number) => void;
    onMudarRegistrosPorPagina: (perPage: number) => void;
  }) => (
    <div>
      <button onClick={() => onMudarPagina(2)}>Página 2</button>
      <button onClick={() => onMudarRegistrosPorPagina(20)}>Exibir 20</button>
    </div>
  ),
}));
vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: ({ exibir }: { exibir: boolean }) => (exibir ? <div>Carregando</div> : null),
}));
vi.mock("@/components/shared/ListaVazia/ListaVazia", () => ({
  ListaVazio: ({ titulo, descricao, textoBotao }: Record<string, string>) => (
    <div>
      {titulo}|{descricao}|{textoBotao}
    </div>
  ),
}));

describe("ProfissionalLista", () => {
  beforeEach(() => {
    mocks.useProfissionais.mockReset();
    mocks.criarColunas.mockClear();
    mocks.tabelaDeDados.mockClear();
    mocks.refetch.mockReset();
    mocks.useProfissionais.mockReturnValue({
      data: { count: 0, results: [] },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mocks.refetch,
    });
  });

  it("exibe os estados de carregamento, erro e lista vazia", () => {
    mocks.useProfissionais.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      refetch: mocks.refetch,
    });
    const { rerender } = render(<ProfissionalLista />);
    expect(screen.getByText("Carregando")).toBeInTheDocument();

    mocks.useProfissionais.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: mocks.refetch,
    });
    rerender(<ProfissionalLista />);
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível carregar");

    mocks.useProfissionais.mockReturnValueOnce({
      data: { count: 0, results: [] },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mocks.refetch,
    });
    rerender(<ProfissionalLista />);
    expect(screen.getByText(/Não há profissionais cadastrados/)).toHaveTextContent(
      "Que tal cadastrar o primeiro profissional agora?",
    );
  });

  it("aplica e limpa filtros, exibindo a mensagem de busca sem resultado", () => {
    render(<ProfissionalLista />);
    fireEvent.click(screen.getByText("Alterar filtro"));
    fireEvent.click(screen.getByText("Buscar"));

    expect(mocks.useProfissionais).toHaveBeenLastCalledWith(
      expect.objectContaining({ nome: "Maria", rg: undefined, cpf: undefined }),
    );
    expect(screen.getByText(/Não encontramos dados para esta busca/)).toHaveTextContent(
      "Experimente remover alguns filtros",
    );

    fireEvent.click(screen.getByText("Limpar"));
    expect(mocks.useProfissionais).toHaveBeenLastCalledWith(
      expect.objectContaining({ nome: undefined, page: 1 }),
    );
  });

  it("renderiza dados e altera página e quantidade por página", () => {
    const profissional = {
      uuid: "1",
      nome: "João da Silva",
      rg: "123456789",
      cpf: "12345678901",
      status: true,
      funcoes: ["Eletricista"],
    } satisfies Profissional;
    mocks.useProfissionais.mockReturnValue({
      data: { count: 21, results: [profissional] },
      isLoading: false,
      isFetching: true,
      isError: false,
      refetch: mocks.refetch,
    });
    render(<ProfissionalLista />);

    expect(screen.getByText("Tabela de profissionais")).toBeInTheDocument();
    expect(screen.getByText("Tabela de profissionais")).toHaveAttribute("aria-busy", "true");
    const propriedadesTabela = mocks.tabelaDeDados.mock.calls[0][0];
    expect(propriedadesTabela.dados).toEqual([profissional]);
    expect(propriedadesTabela.obterChave(profissional)).toBe("1");
    expect(
      typeof propriedadesTabela.classNameLinha === "function" &&
        propriedadesTabela.classNameLinha(profissional),
    ).toBe("");
    expect(
      typeof propriedadesTabela.classNameLinha === "function" &&
        propriedadesTabela.classNameLinha({ ...profissional, status: false }),
    ).toBe("bg-background text-blocked-foreground");
    fireEvent.click(screen.getByText("Página 2"));
    expect(mocks.useProfissionais).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
    fireEvent.click(screen.getByText("Exibir 20"));
    expect(mocks.useProfissionais).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, page_size: 20 }),
    );
    const configuracaoColunas = mocks.criarColunas.mock.calls[0][0];
    expect(configuracaoColunas.onEditar()).toBeUndefined();
  });
});
