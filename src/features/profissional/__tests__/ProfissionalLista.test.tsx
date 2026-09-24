import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfissionalLista } from "../components/list/ProfissionalLista";

const mocks = vi.hoisted(() => ({
  useProfissionais: vi.fn(),
  criarColunas: vi.fn((_params: { onEditar: () => void }) => []),
}));

vi.mock("../hooks/useProfissionais", () => ({ useProfissionais: mocks.useProfissionais }));
vi.mock("../components/list/ColunasProfissional", () => ({
  criarColunasProfissional: mocks.criarColunas,
}));
vi.mock("../components/list/ProfissionalFiltros", () => ({
  ProfissionalFiltros: ({ onChange, onSearch, onClear }: {
    onChange: (name: string, value: string) => void;
    onSearch: () => void;
    onClear: () => void;
  }) => (
    <div>
      <button onClick={() => onChange("nome", "Maria")}>Alterar filtro</button>
      <button onClick={onSearch}>Buscar</button>
      <button onClick={onClear}>Limpar</button>
    </div>
  ),
}));
vi.mock("../components/list/TabelaProfissional", () => ({
  TabelaProfissional: () => <div>Tabela de profissionais</div>,
}));
vi.mock("@/components/navigation/paginacao/Paginacao", () => ({
  Paginacao: ({ onMudarPagina, onMudarRegistrosPorPagina }: {
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
    <div>{titulo}|{descricao}|{textoBotao}</div>
  ),
}));

describe("ProfissionalLista", () => {
  beforeEach(() => {
    mocks.useProfissionais.mockReset();
    mocks.criarColunas.mockClear();
    mocks.useProfissionais.mockReturnValue({
      data: { count: 0, results: [] },
      isLoading: false,
      isError: false,
    });
  });

  it("exibe os estados de carregamento, erro e lista vazia", () => {
    mocks.useProfissionais.mockReturnValueOnce({ data: undefined, isLoading: true, isError: false });
    const { rerender } = render(<ProfissionalLista />);
    expect(screen.getByText("Carregando")).toBeInTheDocument();

    mocks.useProfissionais.mockReturnValueOnce({ data: undefined, isLoading: false, isError: true });
    rerender(<ProfissionalLista />);
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível carregar");

    mocks.useProfissionais.mockReturnValueOnce({ data: { count: 0, results: [] }, isLoading: false, isError: false });
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
    expect(mocks.useProfissionais).toHaveBeenLastCalledWith(expect.objectContaining({ nome: undefined, page: 1 }));
  });

  it("renderiza dados e altera página e quantidade por página", () => {
    mocks.useProfissionais.mockReturnValue({
      data: { count: 21, results: [{ uuid: "1" }] },
      isLoading: false,
      isError: false,
    });
    render(<ProfissionalLista />);

    expect(screen.getByText("Tabela de profissionais")).toBeInTheDocument();
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
