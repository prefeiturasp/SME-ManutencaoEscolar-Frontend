import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ListarCargo } from "@/features/cargo/components/ListarCargo";
import { useListarCargos } from "@/features/cargo/hooks/useListarCargo";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("../hooks/useListarCargo", () => ({
  useListarCargos: vi.fn(),
}));

vi.mock("../components/FiltrosCargo", () => ({
  FiltrosCargo: ({
    nome,
    exige_documento,
    onMudarNome,
    onMudarExigeDocumento,
    onBuscar,
    onLimpar,
  }: {
    nome: string;
    exige_documento: string;
    onMudarNome: (valor: string) => void;
    onMudarExigeDocumento: (valor: "true" | "false" | "") => void;
    onBuscar: () => void;
    onLimpar: () => void;
  }) => (
    <div>
      <input
        aria-label="Nome do cargo"
        value={nome}
        onChange={(event) => onMudarNome(event.target.value)}
      />

      <select
        aria-label="Exige documento"
        value={exige_documento}
        onChange={(event) =>
          onMudarExigeDocumento(event.target.value as "true" | "false" | "")
        }
      >
        <option value="">Todos</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>

      <button type="button" onClick={onBuscar}>
        Buscar
      </button>

      <button type="button" onClick={onLimpar}>
        Limpar filtros
      </button>
    </div>
  ),
}));

vi.mock("../components/TabelaCargo", () => ({
  TabelaCargo: ({
    cargos,
    atualizando,
    colunas,
  }: {
    cargos: Array<{ uuid: string; nome: string }>;
    atualizando: boolean;
    colunas: Array<{
      renderizar: (cargo: { uuid: string; nome: string }) => unknown;
    }>;
  }) => (
    <div data-testid="tabela-cargos">
      {atualizando && <span>Atualizando cargos</span>}

      {cargos.map((cargo) => (
        <div key={cargo.uuid}>
          <span>{cargo.nome}</span>

          <button type="button" onClick={() => colunas[0].renderizar(cargo)}>
            Editar {cargo.nome}
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../components/colunasCargo", () => ({
  criarColunasCargo: ({
    onEditar,
  }: {
    onEditar: (cargo: { uuid: string; nome: string }) => void;
  }) => [{ renderizar: onEditar }],
}));

vi.mock("@/components/navigation/paginacao/Paginacao", () => ({
  Paginacao: ({
    onMudarPagina,
    onMudarRegistrosPorPagina,
  }: {
    onMudarPagina: (pagina: number) => void;
    onMudarRegistrosPorPagina: (quantidade: number) => void;
  }) => (
    <div>
      <button type="button" onClick={() => onMudarPagina(2)}>
        Página 2
      </button>

      <button type="button" onClick={() => onMudarRegistrosPorPagina(20)}>
        Mostrar 20
      </button>

      <button
        type="button"
        onClick={() => onMudarPagina(undefined as unknown as number)}
      >
        Página indefinida
      </button>

      <button
        type="button"
        onClick={() =>
          onMudarRegistrosPorPagina(undefined as unknown as number)
        }
      >
        Quantidade indefinida
      </button>
    </div>
  ),
}));

vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: ({ exibir, titulo }: { exibir: boolean; titulo: string }) =>
    exibir ? <p>{titulo}</p> : null,
}));

vi.mock("@/components/shared/ListaVazia/ListaVazia", () => ({
  ListaVazio: ({ titulo }: { titulo: string }) => <p>{titulo}</p>,
}));

const cargo = {
  uuid: "uuid-cargo-1",
  nome: "Engenheiro",
};

type ResultadoHook = ReturnType<typeof useListarCargos>;

function configurarHook({
  results = [cargo],
  count = results.length,
  isLoading = false,
  isFetching = false,
  isError = false,
}: {
  results?: Array<typeof cargo>;
  count?: number;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
} = {}) {
  vi.mocked(useListarCargos).mockReturnValue({
    data: { results, count },
    isLoading,
    isFetching,
    isError,
  } as ResultadoHook);
}

describe("ListarCargo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configurarHook();
  });

  it("consulta a primeira página e mostra os cargos", () => {
    render(<ListarCargo />);

    expect(useListarCargos).toHaveBeenCalledWith({
      page: 1,
      page_size: 10,
    });

    expect(screen.getByText("Engenheiro")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /cadastrar cargo/i }),
    ).toHaveAttribute("href", "/cargos/cadastrar");
  });

  it("aplica o nome sem espaços e o filtro Sim", () => {
    render(<ListarCargo />);

    fireEvent.change(screen.getByLabelText("Nome do cargo"), {
      target: { value: "  Engenheiro  " },
    });

    fireEvent.change(screen.getByLabelText("Exige documento"), {
      target: { value: "true" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(useListarCargos).toHaveBeenLastCalledWith({
      nome: "Engenheiro",
      exige_documento: true,
      page: 1,
      page_size: 10,
    });
  });

  it("converte o filtro Não para false", () => {
    render(<ListarCargo />);

    fireEvent.change(screen.getByLabelText("Exige documento"), {
      target: { value: "false" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(useListarCargos).toHaveBeenLastCalledWith({
      nome: undefined,
      exige_documento: false,
      page: 1,
      page_size: 10,
    });
  });

  it("envia filtros indefinidos quando a busca está vazia", () => {
    render(<ListarCargo />);

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(useListarCargos).toHaveBeenLastCalledWith({
      nome: undefined,
      exige_documento: undefined,
      page: 1,
      page_size: 10,
    });
  });

  it("muda de página", () => {
    render(<ListarCargo />);

    fireEvent.click(screen.getByRole("button", { name: "Página 2" }));

    expect(useListarCargos).toHaveBeenLastCalledWith({
      page: 2,
      page_size: 10,
    });
  });

  it("volta à primeira página ao mudar a quantidade de registros", () => {
    render(<ListarCargo />);

    fireEvent.click(screen.getByRole("button", { name: "Página 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Mostrar 20" }));

    expect(useListarCargos).toHaveBeenLastCalledWith({
      page: 1,
      page_size: 20,
    });
  });

  it("usa a página padrão caso a paginação envie undefined", () => {
    render(<ListarCargo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Página indefinida",
      }),
    );

    expect(useListarCargos).toHaveBeenLastCalledWith({
      page: undefined,
      page_size: 10,
    });

    expect(screen.getByText("Engenheiro")).toBeInTheDocument();
  });

  it("usa a quantidade padrão caso a paginação envie undefined", () => {
    render(<ListarCargo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Quantidade indefinida",
      }),
    );

    expect(useListarCargos).toHaveBeenLastCalledWith({
      page: 1,
      page_size: undefined,
    });

    expect(screen.getByText("Engenheiro")).toBeInTheDocument();
  });

  it("limpa os filtros aplicados", () => {
    render(<ListarCargo />);

    fireEvent.change(screen.getByLabelText("Nome do cargo"), {
      target: { value: "Engenheiro" },
    });

    fireEvent.change(screen.getByLabelText("Exige documento"), {
      target: { value: "true" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));

    expect(screen.getByLabelText("Nome do cargo")).toHaveValue("");
    expect(screen.getByLabelText("Exige documento")).toHaveValue("");

    expect(useListarCargos).toHaveBeenLastCalledWith({
      page: 1,
      page_size: 10,
    });
  });

  it("permite limpar quando os campos já estão vazios", () => {
    render(<ListarCargo />);

    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));

    expect(useListarCargos).toHaveBeenLastCalledWith({
      page: 1,
      page_size: 10,
    });
  });

  it("mostra o carregamento inicial", () => {
    configurarHook({ isLoading: true });

    render(<ListarCargo />);

    expect(screen.getByText("Carregando os cargos...")).toBeInTheDocument();
    expect(screen.queryByTestId("tabela-cargos")).not.toBeInTheDocument();
  });

  it("mostra erro quando a consulta falha", () => {
    configurarHook({ isError: true });

    render(<ListarCargo />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar os cargos.",
    );
    expect(screen.queryByTestId("tabela-cargos")).not.toBeInTheDocument();
  });

  it("mostra o estado vazio inicial", () => {
    configurarHook({ results: [], count: 0 });

    render(<ListarCargo />);

    expect(screen.getByText("Não há cargos cadastrados")).toBeInTheDocument();
  });

  it("mostra o estado vazio quando data é undefined", () => {
    vi.mocked(useListarCargos).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
    } as ResultadoHook);

    render(<ListarCargo />);

    expect(screen.getByText("Não há cargos cadastrados")).toBeInTheDocument();
  });

  it("mostra o estado vazio de uma busca por nome", () => {
    configurarHook({ results: [], count: 0 });

    render(<ListarCargo />);

    fireEvent.change(screen.getByLabelText("Nome do cargo"), {
      target: { value: "Inexistente" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(
      screen.getByText("Não encontramos dados para esta busca"),
    ).toBeInTheDocument();
  });

  it("mostra o estado vazio ao filtrar apenas por documento", () => {
    configurarHook({ results: [], count: 0 });

    render(<ListarCargo />);

    fireEvent.change(screen.getByLabelText("Exige documento"), {
      target: { value: "false" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(
      screen.getByText("Não encontramos dados para esta busca"),
    ).toBeInTheDocument();
  });

  it("mantém a tabela visível durante a atualização", () => {
    configurarHook({ isFetching: true });

    render(<ListarCargo />);

    expect(screen.getByTestId("tabela-cargos")).toBeInTheDocument();
    expect(screen.getByText("Atualizando cargos")).toBeInTheDocument();
  });

  it("abre a edição do cargo selecionado", () => {
    render(<ListarCargo />);

    fireEvent.click(screen.getByRole("button", { name: "Editar Engenheiro" }));

    expect(pushMock).toHaveBeenCalledWith("/cargos/uuid-cargo-1/editar");
  });
});
