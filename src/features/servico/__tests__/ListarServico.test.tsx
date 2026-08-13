import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ListarServico } from "../components/Servico/ListarServico";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  useListarServicos: vi.fn(),
  criarColunasServico: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: PropsWithChildren<{
    href: string;
    className?: string;
  }>) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/icons/plus", () => ({
  PlusIcon: () => <span data-testid="plus-icon">+</span>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    asChild,
    children,
  }: PropsWithChildren<{
    asChild?: boolean;
    variant?: string;
    size?: string;
  }>) => {
    if (asChild) {
      return children;
    }

    return <button type="button">{children}</button>;
  },
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: PropsWithChildren) => <div>{children}</div>,
  CardTitle: ({ children }: PropsWithChildren) => <h2>{children}</h2>,
  CardDescription: ({ children }: PropsWithChildren) => <p>{children}</p>,
}));

vi.mock("@/features/servico/hooks/useListarServico", () => ({
  useListarServicos: mocks.useListarServicos,
}));

vi.mock("@/features/servico/components/Servico/colunasServico", () => ({
  criarColunasServico: mocks.criarColunasServico,
}));

vi.mock("@/features/servico/components/Servico/FiltrosServico", () => ({
  FiltrosServico: ({
    nome,
    status,
    onMudarNome,
    onMudarStatus,
    onBuscar,
    onLimpar,
  }: {
    nome: string;
    status: string;
    onMudarNome: (nome: string) => void;
    onMudarStatus: (status: "ativo" | "inativo" | "") => void;
    onBuscar: () => void;
    onLimpar: () => void;
  }) => (
    <div>
      <input
        aria-label="Nome do serviço"
        value={nome}
        onChange={(event) => onMudarNome(event.target.value)}
      />

      <span data-testid="status-atual">{status || "todos"}</span>

      <button type="button" onClick={() => onMudarStatus("ativo")}>
        Selecionar ativo
      </button>

      <button type="button" onClick={() => onMudarStatus("inativo")}>
        Selecionar inativo
      </button>

      <button type="button" onClick={() => onMudarStatus("")}>
        Selecionar todos
      </button>

      <button type="button" onClick={onBuscar}>
        Buscar
      </button>

      <button type="button" onClick={onLimpar}>
        Limpar
      </button>
    </div>
  ),
}));

vi.mock("@/features/servico/components/Servico/TabelaServico", () => ({
  TabelaServico: ({
    servicos,
    colunas,
    atualizando,
  }: {
    servicos: Array<{
      id: number;
      uuid: string;
      nome: string;
      status: boolean;
    }>;
    colunas: Array<{
      onEditar: (servico: {
        id: number;
        uuid: string;
        nome: string;
        status: boolean;
      }) => void;
    }>;
    atualizando: boolean;
  }) => (
    <div data-testid="tabela-servicos">
      <span>{atualizando ? "Atualizando" : "Atualizada"}</span>

      {servicos.map((servico) => (
        <div key={servico.uuid}>
          <span>{servico.nome}</span>

          <button type="button" onClick={() => colunas[0].onEditar(servico)}>
            Editar {servico.nome}
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: ({ titulo }: { titulo?: string }) => (
    <div role="status">{titulo}</div>
  ),
}));

vi.mock("@/components/shared/ListaVazia/ListaVazia", () => ({
  ListaVazio: ({
    titulo,
    descricao,
    textoBotao,
    href,
  }: {
    titulo: string;
    descricao?: string;
    textoBotao?: string;
    href?: string;
  }) => (
    <div data-testid="lista-vazia">
      <h3>{titulo}</h3>

      {descricao && <p>{descricao}</p>}

      {textoBotao && href && <a href={href}>{textoBotao}</a>}
    </div>
  ),
}));

vi.mock("@/components/navigation/paginacao/Paginacao", () => ({
  Paginacao: ({
    paginaAtual,
    totalRegistros,
    registrosPorPagina,
    onMudarPagina,
    onMudarRegistrosPorPagina,
  }: {
    paginaAtual: number;
    totalRegistros: number;
    registrosPorPagina: number;
    onMudarPagina: (pagina: number) => void;
    onMudarRegistrosPorPagina: (quantidade: number) => void;
  }) => (
    <div data-testid="paginacao">
      <span data-testid="pagina-atual">{paginaAtual}</span>
      <span data-testid="total-registros">{totalRegistros}</span>
      <span data-testid="registros-por-pagina">{registrosPorPagina}</span>

      <button type="button" onClick={() => onMudarPagina(2)}>
        Ir para página 2
      </button>

      <button type="button" onClick={() => onMudarRegistrosPorPagina(25)}>
        Exibir 25
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

const servico = {
  id: 1,
  uuid: "uuid-eletrica",
  nome: "Elétrica",
  status: true,
};

describe("ListarServico", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.criarColunasServico.mockImplementation(
      ({ onEditar }: { onEditar: (item: typeof servico) => void }) => [
        { onEditar },
      ],
    );

    mocks.useListarServicos.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      isError: false,
    });
  });

  it("deve limpar quando somente o status estiver preenchido", async () => {
    mocks.useListarServicos.mockReturnValue({
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarServico />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar ativo",
      }),
    );

    expect(screen.getByLabelText("Nome do serviço")).toHaveValue("");
    expect(screen.getByTestId("status-atual")).toHaveTextContent("ativo");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Limpar",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("status-atual")).toHaveTextContent("todos");

      expect(mocks.useListarServicos).toHaveBeenLastCalledWith({
        page: 1,
        page_size: 10,
      });
    });
  });

  it("deve manter os campos vazios ao limpar sem filtros", async () => {
    mocks.useListarServicos.mockReturnValue({
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarServico />);

    expect(screen.getByLabelText("Nome do serviço")).toHaveValue("");
    expect(screen.getByTestId("status-atual")).toHaveTextContent("todos");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Limpar",
      }),
    );

    await waitFor(() => {
      expect(mocks.useListarServicos).toHaveBeenLastCalledWith({
        page: 1,
        page_size: 10,
      });
    });
  });

  it("deve renderizar o cabeçalho, card e link de cadastro", () => {
    render(<ListarServico />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Serviços" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Refine sua busca" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Utilize o filtro para localizar os serviços cadastrados.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Cadastrar serviços/i }),
    ).toHaveAttribute("href", "/cadastro/servicos/cadastrar");

    expect(screen.getByTestId("plus-icon")).toBeInTheDocument();

    expect(mocks.useListarServicos).toHaveBeenCalledWith({
      page: 1,
      page_size: 10,
    });

    expect(screen.queryByTestId("lista-vazia")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tabela-servicos")).not.toBeInTheDocument();
    expect(screen.queryByTestId("paginacao")).not.toBeInTheDocument();
  });

  it("deve mostrar erro ao não conseguir carregar os serviços", () => {
    mocks.useListarServicos.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
    });

    render(<ListarServico />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar os serviços.",
    );

    expect(screen.queryByTestId("lista-vazia")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tabela-servicos")).not.toBeInTheDocument();
    expect(screen.queryByTestId("paginacao")).not.toBeInTheDocument();
  });

  it("deve mostrar a lista vazia quando não existem serviços cadastrados", () => {
    mocks.useListarServicos.mockReturnValue({
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarServico />);

    expect(screen.getByText("Não há serviços cadastrados")).toBeInTheDocument();

    expect(
      screen.getByText("Que tal cadastrar o primeiro serviço agora?"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Cadastrar serviço" }),
    ).toHaveAttribute("href", "/cadastro/servicos/cadastrar");
  });

  it("deve buscar pelo nome e pelo status ativo", async () => {
    mocks.useListarServicos.mockReturnValue({
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarServico />);

    fireEvent.change(screen.getByLabelText("Nome do serviço"), {
      target: { value: "  Elétrica  " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Selecionar ativo" }));

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    await waitFor(() => {
      expect(mocks.useListarServicos).toHaveBeenLastCalledWith({
        nome: "Elétrica",
        status: true,
        page: 1,
        page_size: 10,
      });
    });

    expect(
      screen.getByText("Não encontramos dados para esta busca"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Experimente remover alguns filtros ou selecionar outros critérios de busca.",
      ),
    ).toBeInTheDocument();
  });

  it("deve buscar somente pelo status inativo", async () => {
    mocks.useListarServicos.mockReturnValue({
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarServico />);

    fireEvent.click(screen.getByRole("button", { name: "Selecionar inativo" }));

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    await waitFor(() => {
      expect(mocks.useListarServicos).toHaveBeenLastCalledWith({
        nome: undefined,
        status: false,
        page: 1,
        page_size: 10,
      });
    });

    expect(
      screen.getByText("Não encontramos dados para esta busca"),
    ).toBeInTheDocument();
  });

  it("deve aplicar undefined quando nome e status estiverem vazios", async () => {
    mocks.useListarServicos.mockReturnValue({
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarServico />);

    fireEvent.change(screen.getByLabelText("Nome do serviço"), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Selecionar todos" }));

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    await waitFor(() => {
      expect(mocks.useListarServicos).toHaveBeenLastCalledWith({
        nome: undefined,
        status: undefined,
        page: 1,
        page_size: 10,
      });
    });

    expect(screen.getByText("Não há serviços cadastrados")).toBeInTheDocument();
  });

  it("deve limpar os filtros mantendo a quantidade de registros", async () => {
    mocks.useListarServicos.mockReturnValue({
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarServico />);

    fireEvent.click(screen.getByRole("button", { name: "Selecionar ativo" }));

    fireEvent.change(screen.getByLabelText("Nome do serviço"), {
      target: { value: "Pintura" },
    });

    expect(screen.getByTestId("status-atual")).toHaveTextContent("ativo");
    expect(screen.getByLabelText("Nome do serviço")).toHaveValue("Pintura");

    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Nome do serviço")).toHaveValue("");
      expect(screen.getByTestId("status-atual")).toHaveTextContent("todos");

      expect(mocks.useListarServicos).toHaveBeenLastCalledWith({
        page: 1,
        page_size: 10,
      });
    });
  });

  it("deve informar à tabela quando os dados estiverem sendo atualizados", () => {
    mocks.useListarServicos.mockReturnValue({
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [servico],
      },
      isLoading: false,
      isFetching: true,
      isError: false,
    });

    render(<ListarServico />);

    expect(screen.getByText("Atualizando")).toBeInTheDocument();
  });

  it("deve mudar a página atual", async () => {
    mocks.useListarServicos.mockReturnValue({
      data: {
        count: 30,
        next: "/servicos?page=2",
        previous: null,
        results: [servico],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarServico />);

    fireEvent.click(screen.getByRole("button", { name: "Ir para página 2" }));

    await waitFor(() => {
      expect(mocks.useListarServicos).toHaveBeenLastCalledWith({
        page: 2,
        page_size: 10,
      });

      expect(screen.getByTestId("pagina-atual")).toHaveTextContent("2");
    });
  });

  it("deve mudar os registros por página e voltar para a primeira página", async () => {
    mocks.useListarServicos.mockReturnValue({
      data: {
        count: 30,
        next: "/servicos?page=2",
        previous: null,
        results: [servico],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarServico />);

    fireEvent.click(screen.getByRole("button", { name: "Ir para página 2" }));

    fireEvent.click(screen.getByRole("button", { name: "Exibir 25" }));

    await waitFor(() => {
      expect(mocks.useListarServicos).toHaveBeenLastCalledWith({
        page: 1,
        page_size: 25,
      });

      expect(screen.getByTestId("pagina-atual")).toHaveTextContent("1");
      expect(screen.getByTestId("registros-por-pagina")).toHaveTextContent(
        "25",
      );
    });
  });

  it("deve navegar para a edição do serviço", () => {
    mocks.useListarServicos.mockReturnValue({
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [servico],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarServico />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Editar Elétrica",
      }),
    );

    expect(mocks.push).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith(
      `/cadastro/servicos/${servico.uuid}/editar`,
    );
  });

  it("deve usar os valores padrão quando página e quantidade forem undefined", async () => {
    mocks.useListarServicos.mockReturnValue({
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [servico],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarServico />);

    fireEvent.click(screen.getByRole("button", { name: "Página indefinida" }));

    await waitFor(() => {
      expect(screen.getByTestId("pagina-atual")).toHaveTextContent("1");
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Quantidade indefinida" }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("registros-por-pagina")).toHaveTextContent(
        "10",
      );
    });
  });
});
