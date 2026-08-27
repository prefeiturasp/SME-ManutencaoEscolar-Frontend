import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ListarLotes } from "@/features/lotes/components/ListarLotes";

type LoteMock = {
  id: number;
  uuid: string;
  codigo_cadastro: string;
  nome: string;
  status: boolean;
};

type OpcaoMock = {
  label: string;
  value: string;
};

type OnEditarMock = (lote: LoteMock) => void;

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  useLotes: vi.fn(),
  useEmpresas: vi.fn(),
  useListarDiretoriasRegionais: vi.fn(),
  criarColunasLote: vi.fn(),
  onEditar: undefined as OnEditarMock | undefined,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock("@/features/lotes/hooks/useLotes", () => ({
  useLotes: mocks.useLotes,
}));

vi.mock("@/features/empresa/hooks/useEmpresas", () => ({
  useEmpresas: mocks.useEmpresas,
}));

vi.mock("@/features/diretoria_regional/hooks/useDiretoriaRegional", () => ({
  useListarDiretoriasRegionais: mocks.useListarDiretoriasRegionais,
}));

vi.mock("@/components/icons/plus", () => ({
  PlusIcon: () => (
    <svg data-testid="plus-icon" aria-label="Ícone de adicionar" />
  ),
}));

vi.mock("@/features/lotes/components/ColunasLote", () => ({
  criarColunasLote: (parametros: { onEditar: OnEditarMock }) => {
    mocks.onEditar = parametros.onEditar;
    mocks.criarColunasLote(parametros);

    return [];
  },
}));

vi.mock("@/features/lotes/components/LoteFiltros", () => ({
  LoteFiltros: ({
    codigoCadastro,
    nome,
    status,
    empresa,
    diretoriasRegionais,
    periodoInicial,
    periodoFinal,
    opcoesEmpresas,
    opcoesDiretoriasRegionais,
    onMudarCodigoCadastro,
    onMudarNome,
    onMudarStatus,
    onMudarEmpresa,
    onMudarDiretoriasRegionais,
    onMudarPeriodoInicial,
    onMudarPeriodoFinal,
    onBuscar,
    onLimpar,
  }: {
    codigoCadastro: string;
    nome: string;
    status: string;
    empresa: string;
    diretoriasRegionais: string[];
    periodoInicial: string;
    periodoFinal: string;
    opcoesEmpresas: OpcaoMock[];
    opcoesDiretoriasRegionais: OpcaoMock[];
    onMudarCodigoCadastro: (valor: string) => void;
    onMudarNome: (valor: string) => void;
    onMudarStatus: (valor: "" | "ativo" | "inativo") => void;
    onMudarEmpresa: (valor: string) => void;
    onMudarDiretoriasRegionais: (valores: string[]) => void;
    onMudarPeriodoInicial: (valor: string) => void;
    onMudarPeriodoFinal: (valor: string) => void;
    onBuscar: () => void;
    onLimpar: () => void;
  }) => (
    <div data-testid="filtros-lote">
      <label htmlFor="codigoCadastro">Código de cadastro</label>
      <input
        id="codigoCadastro"
        value={codigoCadastro}
        onChange={(event) => {
          onMudarCodigoCadastro(event.target.value);
        }}
      />

      <label htmlFor="nome">Nome</label>
      <input
        id="nome"
        value={nome}
        onChange={(event) => {
          onMudarNome(event.target.value);
        }}
      />

      <span data-testid="status-atual">{status}</span>
      <span data-testid="empresa-atual">{empresa}</span>
      <span data-testid="dres-atuais">{diretoriasRegionais.join(",")}</span>

      <label htmlFor="periodoInicial">Período inicial</label>
      <input
        id="periodoInicial"
        value={periodoInicial}
        onChange={(event) => {
          onMudarPeriodoInicial(event.target.value);
        }}
      />

      <label htmlFor="periodoFinal">Período final</label>
      <input
        id="periodoFinal"
        value={periodoFinal}
        onChange={(event) => {
          onMudarPeriodoFinal(event.target.value);
        }}
      />

      <span data-testid="opcoes-empresas">
        {opcoesEmpresas
          .map((opcao) => `${opcao.label}:${opcao.value}`)
          .join("|")}
      </span>

      <span data-testid="opcoes-dres">
        {opcoesDiretoriasRegionais
          .map((opcao) => `${opcao.label}:${opcao.value}`)
          .join("|")}
      </span>

      <button
        type="button"
        onClick={() => {
          onMudarStatus("ativo");
        }}
      >
        Selecionar ativo
      </button>

      <button
        type="button"
        onClick={() => {
          onMudarStatus("inativo");
        }}
      >
        Selecionar inativo
      </button>

      <button
        type="button"
        onClick={() => {
          onMudarEmpresa("2");
        }}
      >
        Selecionar empresa
      </button>

      <button
        type="button"
        onClick={() => {
          onMudarDiretoriasRegionais(["1", "3"]);
        }}
      >
        Selecionar DREs
      </button>

      <button type="button" onClick={onBuscar}>
        Buscar lotes
      </button>

      <button type="button" onClick={onLimpar}>
        Limpar filtros
      </button>
    </div>
  ),
}));

vi.mock("@/features/lotes/components/TabelaLote", () => ({
  TabelaLote: ({
    lotes,
    atualizando,
  }: {
    lotes: LoteMock[];
    atualizando: boolean;
  }) => (
    <div data-testid="tabela-lote">
      <span data-testid="quantidade-lotes">{lotes.length}</span>
      <span data-testid="tabela-atualizando">{String(atualizando)}</span>

      <button
        type="button"
        onClick={() => {
          const primeiroLote = lotes[0];

          if (primeiroLote) {
            mocks.onEditar?.(primeiroLote);
          }
        }}
      >
        Editar lote
      </button>
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

      <button
        type="button"
        onClick={() => {
          onMudarPagina(2);
        }}
      >
        Próxima página
      </button>

      <button
        type="button"
        onClick={() => {
          onMudarRegistrosPorPagina(20);
        }}
      >
        Exibir 20
      </button>
    </div>
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
    descricao: string;
    textoBotao?: string;
    href?: string;
  }) => (
    <div data-testid="lista-vazia">
      <h3>{titulo}</h3>
      <p>{descricao}</p>

      {textoBotao && href && <a href={href}>{textoBotao}</a>}
    </div>
  ),
}));

vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: ({ exibir, titulo }: { exibir: boolean; titulo: string }) =>
    exibir ? <div data-testid="loading-global">{titulo}</div> : null,
}));

const loteMock: LoteMock = {
  id: 11,
  uuid: "77d042b4-f9d5-40fb-9c77-7aaca777a80c",
  codigo_cadastro: "LOTE-001",
  nome: "Lote de pintura",
  status: true,
};

function mockarListaComLote() {
  mocks.useLotes.mockReturnValue({
    data: {
      count: 1,
      next: null,
      previous: null,
      results: [loteMock],
    },
    isLoading: false,
    isFetching: false,
    isError: false,
  });
}

function mockarListaVazia() {
  mocks.useLotes.mockReturnValue({
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
}

describe("ListarLotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.onEditar = undefined;

    mockarListaComLote();

    mocks.useEmpresas.mockReturnValue({
      data: [
        {
          id: 1,
          uuid: "empresa-uuid-1",
          nome: "Empresa teste",
        },
        {
          id: 2,
          uuid: "empresa-uuid-2",
          nome: "Empresa 2",
        },
      ],
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    mocks.useListarDiretoriasRegionais.mockReturnValue({
      data: {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            nome: "DIRETORIA REGIONAL ITAQUERA",
            nome_curto: "DRE ITAQUERA",
          },
          {
            id: 3,
            nome: "DIRETORIA REGIONAL GUAIANASES",
            nome_curto: "",
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });
  });

  it("renderiza os textos principais da página", () => {
    render(<ListarLotes />);

    expect(
      screen.getByRole("heading", {
        name: "Lotes",
        level: 1,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Refine sua busca")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Utilize os filtros para localizar os lotes cadastrados.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Lotes cadastrados",
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Estes são os lotes que já estão cadastrados no sistema.",
      ),
    ).toBeInTheDocument();
  });

  it("renderiza o link de cadastro e o ícone", () => {
    render(<ListarLotes />);

    const link = screen.getByRole("link", {
      name: /Cadastrar lote/i,
    });

    expect(link).toHaveAttribute("href", "/cadastro/lotes/cadastrar");

    expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
  });

  it("inicia a consulta com a paginação padrão", () => {
    render(<ListarLotes />);

    expect(mocks.useLotes).toHaveBeenCalledWith({
      page: 1,
      page_size: 10,
    });

    expect(mocks.useEmpresas).toHaveBeenCalledWith({
      page_size: "all",
    });

    expect(mocks.useListarDiretoriasRegionais).toHaveBeenCalledTimes(1);
  });

  it("monta as opções de empresas e DREs", () => {
    render(<ListarLotes />);

    expect(screen.getByTestId("opcoes-empresas")).toHaveTextContent(
      "Empresa teste:1|Empresa 2:2",
    );

    expect(screen.getByTestId("opcoes-dres")).toHaveTextContent(
      "DRE ITAQUERA:1|DIRETORIA REGIONAL GUAIANASES:3",
    );
  });

  it("utiliza listas vazias quando empresas e DREs não foram carregadas", () => {
    mocks.useEmpresas.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    mocks.useListarDiretoriasRegionais.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarLotes />);

    expect(screen.getByTestId("opcoes-empresas")).toBeEmptyDOMElement();

    expect(screen.getByTestId("opcoes-dres")).toBeEmptyDOMElement();
  });

  it("aplica todos os filtros com status ativo", () => {
    render(<ListarLotes />);

    fireEvent.change(screen.getByLabelText("Código de cadastro"), {
      target: {
        value: "  LOTE-001  ",
      },
    });

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: {
        value: "  Pintura  ",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar ativo",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar empresa",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar DREs",
      }),
    );

    fireEvent.change(screen.getByLabelText("Período inicial"), {
      target: {
        value: "30/05/2026",
      },
    });

    fireEvent.change(screen.getByLabelText("Período final"), {
      target: {
        value: "2026-06-30",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Buscar lotes",
      }),
    );

    expect(mocks.useLotes).toHaveBeenLastCalledWith({
      codigo_cadastro: "LOTE-001",
      nome: "Pintura",
      status: true,
      empresa: 2,
      diretorias_regionais: "1,3",
      periodo_inicial: "2026-05-30",
      periodo_final: "2026-06-30",
      page: 1,
      page_size: 10,
    });
  });

  it("converte o status inativo para false", () => {
    render(<ListarLotes />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar inativo",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Buscar lotes",
      }),
    );

    expect(mocks.useLotes).toHaveBeenLastCalledWith({
      codigo_cadastro: undefined,
      nome: undefined,
      status: false,
      empresa: undefined,
      diretorias_regionais: undefined,
      periodo_inicial: undefined,
      periodo_final: undefined,
      page: 1,
      page_size: 10,
    });
  });

  it("monta as opções quando a resposta de empresas é paginada", () => {
    mocks.useEmpresas.mockReturnValue({
      data: {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 10,
            uuid: "empresa-uuid-10",
            nome: "Empresa Paginada 1",
          },
          {
            id: 20,
            uuid: "empresa-uuid-20",
            nome: "Empresa Paginada 2",
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarLotes />);

    expect(screen.getByTestId("opcoes-empresas")).toHaveTextContent(
      "Empresa Paginada 1:10|Empresa Paginada 2:20",
    );
  });

  it("monta as opções quando empresas retorna uma lista", () => {
    render(<ListarLotes />);

    expect(screen.getByTestId("opcoes-empresas")).toHaveTextContent(
      "Empresa teste:1|Empresa 2:2",
    );
  });

  it("monta as opções quando a resposta de empresas é paginada", () => {
    mocks.useEmpresas.mockReturnValue({
      data: {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 10,
            uuid: "empresa-uuid-10",
            nome: "Empresa Paginada 1",
          },
          {
            id: 20,
            uuid: "empresa-uuid-20",
            nome: "Empresa Paginada 2",
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarLotes />);

    expect(screen.getByTestId("opcoes-empresas")).toHaveTextContent(
      "Empresa Paginada 1:10|Empresa Paginada 2:20",
    );
  });

  it("utiliza listas vazias quando empresas e DREs não foram carregadas", () => {
    mocks.useEmpresas.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    mocks.useListarDiretoriasRegionais.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(<ListarLotes />);

    expect(screen.getByTestId("opcoes-empresas")).toBeEmptyDOMElement();
    expect(screen.getByTestId("opcoes-dres")).toBeEmptyDOMElement();
  });

  it("envia filtros vazios como undefined", () => {
    render(<ListarLotes />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Buscar lotes",
      }),
    );

    expect(mocks.useLotes).toHaveBeenLastCalledWith({
      codigo_cadastro: undefined,
      nome: undefined,
      status: undefined,
      empresa: undefined,
      diretorias_regionais: undefined,
      periodo_inicial: undefined,
      periodo_final: undefined,
      page: 1,
      page_size: 10,
    });
  });

  it("limpa todos os filtros", () => {
    render(<ListarLotes />);

    fireEvent.change(screen.getByLabelText("Código de cadastro"), {
      target: {
        value: "LOTE-001",
      },
    });

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: {
        value: "Pintura",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar ativo",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar empresa",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar DREs",
      }),
    );

    fireEvent.change(screen.getByLabelText("Período inicial"), {
      target: {
        value: "30/05/2026",
      },
    });

    fireEvent.change(screen.getByLabelText("Período final"), {
      target: {
        value: "30/06/2026",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Limpar filtros",
      }),
    );

    expect(screen.getByLabelText("Código de cadastro")).toHaveValue("");

    expect(screen.getByLabelText("Nome")).toHaveValue("");

    expect(screen.getByTestId("status-atual")).toBeEmptyDOMElement();

    expect(screen.getByTestId("empresa-atual")).toBeEmptyDOMElement();

    expect(screen.getByTestId("dres-atuais")).toBeEmptyDOMElement();

    expect(screen.getByLabelText("Período inicial")).toHaveValue("");

    expect(screen.getByLabelText("Período final")).toHaveValue("");

    expect(mocks.useLotes).toHaveBeenLastCalledWith({
      page: 1,
      page_size: 10,
    });
  });

  it("muda a página mantendo os filtros atuais", () => {
    render(<ListarLotes />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Próxima página",
      }),
    );

    expect(mocks.useLotes).toHaveBeenLastCalledWith({
      page: 2,
      page_size: 10,
    });

    expect(screen.getByTestId("pagina-atual")).toHaveTextContent("2");
  });

  it("muda a quantidade de registros e volta para a primeira página", () => {
    render(<ListarLotes />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Próxima página",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Exibir 20",
      }),
    );

    expect(mocks.useLotes).toHaveBeenLastCalledWith({
      page: 1,
      page_size: 20,
    });

    expect(screen.getByTestId("registros-por-pagina")).toHaveTextContent("20");
  });

  it("renderiza a tabela e a paginação quando existem lotes", () => {
    render(<ListarLotes />);

    expect(screen.getByTestId("tabela-lote")).toBeInTheDocument();

    expect(screen.getByTestId("quantidade-lotes")).toHaveTextContent("1");

    expect(screen.getByTestId("paginacao")).toBeInTheDocument();

    expect(screen.getByTestId("total-registros")).toHaveTextContent("1");
  });

  it("informa a tabela quando os dados estão sendo atualizados", () => {
    mocks.useLotes.mockReturnValue({
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [loteMock],
      },
      isLoading: false,
      isFetching: true,
      isError: false,
    });

    render(<ListarLotes />);

    expect(screen.getByTestId("tabela-atualizando")).toHaveTextContent("true");
  });

  it("navega para a edição do lote", () => {
    render(<ListarLotes />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Editar lote",
      }),
    );

    expect(mocks.push).toHaveBeenCalledWith(
      "/cadastro/lotes/77d042b4-f9d5-40fb-9c77-7aaca777a80c/editar",
    );
  });

  it("exibe o carregamento", () => {
    mocks.useLotes.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      isError: false,
    });

    render(<ListarLotes />);

    expect(screen.getByTestId("loading-global")).toHaveTextContent(
      "Carregando os lotes...",
    );

    expect(screen.queryByTestId("tabela-lote")).not.toBeInTheDocument();

    expect(screen.queryByTestId("paginacao")).not.toBeInTheDocument();
  });

  it("exibe a mensagem de erro", () => {
    mocks.useLotes.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
    });

    render(<ListarLotes />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar os lotes.",
    );

    expect(screen.queryByTestId("tabela-lote")).not.toBeInTheDocument();

    expect(screen.queryByTestId("paginacao")).not.toBeInTheDocument();
  });

  it("exibe o estado vazio quando não existem lotes", () => {
    mockarListaVazia();

    render(<ListarLotes />);

    expect(
      screen.getByRole("heading", {
        name: "Não há lotes cadastrados",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Que tal cadastrar o primeiro lote agora?"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cadastrar lote",
      }),
    ).toHaveAttribute("href", "/cadastro/lotes/cadastrar");
  });

  it("exibe o estado vazio correspondente a uma busca", () => {
    mockarListaVazia();

    render(<ListarLotes />);

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: {
        value: "Lote inexistente",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Buscar lotes",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Não encontramos dados para esta busca",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Experimente remover alguns filtros ou selecionar outros critérios de busca.",
      ),
    ).toBeInTheDocument();
  });
});
