import type { ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ListarServico } from "../components/ServicoForm/ListarServico";

const { useListarServicosMock, listaVaziaMock, paginacaoMock } = vi.hoisted(
  () => ({
    useListarServicosMock: vi.fn(),
    listaVaziaMock: vi.fn(),
    paginacaoMock: vi.fn(),
  }),
);

vi.mock("@/features/servico/hooks/useListarServico", () => ({
  useListarServicos: useListarServicosMock,
}));

vi.mock("@/components/shared/ListaVazia/ListaVazia", () => ({
  ListaVazio: (props: {
    titulo: string;
    descricao: string;
    textoBotao: string;
    href: string;
  }) => {
    listaVaziaMock(props);

    return <div data-testid="lista-vazia">{props.titulo}</div>;
  },
}));

vi.mock("@/components/navigation/paginacao/Paginacao", () => ({
  Paginacao: (props: {
    paginaAtual: number;
    totalRegistros: number;
    registrosPorPagina: number;
    onMudarPagina: (pagina: number) => void;
    onMudarRegistrosPorPagina: (quantidade: number) => void;
  }) => {
    paginacaoMock(props);

    return (
      <div data-testid="paginacao">
        <button
          type="button"
          onClick={() => {
            props.onMudarPagina(2);
          }}
        >
          Ir para página 2
        </button>

        <button
          type="button"
          onClick={() => {
            props.onMudarRegistrosPorPagina(20);
          }}
        >
          Mostrar 20
        </button>
      </div>
    );
  },
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children: ReactNode;
  }) => (
    <div data-testid="select-status" data-value={value}>
      {children}

      <button
        type="button"
        onClick={() => {
          onValueChange("ativo");
        }}
      >
        Selecionar ativo
      </button>

      <button
        type="button"
        onClick={() => {
          onValueChange("inativo");
        }}
      >
        Selecionar inativo
      </button>

      <button
        type="button"
        onClick={() => {
          onValueChange("valor-invalido");
        }}
      >
        Selecionar valor inválido
      </button>
    </div>
  ),

  SelectTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),

  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),

  SelectContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),

  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

function obterUltimosFiltros() {
  const chamadas = useListarServicosMock.mock.calls;

  return chamadas[chamadas.length - 1][0];
}

describe("ListarServico", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useListarServicosMock.mockReturnValue({
      data: undefined,
    });
  });

  it("deve iniciar sem filtros e exibir o estado vazio", () => {
    render(<ListarServico />);

    expect(useListarServicosMock).toHaveBeenCalledWith({
      page: 1,
      page_size: 10,
    });

    expect(screen.getByTestId("lista-vazia")).toHaveTextContent(
      "Não há serviços cadastrados",
    );

    expect(listaVaziaMock).toHaveBeenCalledWith({
      titulo: "Não há serviços cadastrados",
      descricao: "Que tal cadastrar o primeiro serviço agora?",
      textoBotao: "Cadastrar serviço",
      href: "/cadastro/servicos/cadastrar",
    });

    expect(
      screen.getByRole("button", {
        name: "Buscar serviços",
      }),
    ).toBeDisabled();

    expect(paginacaoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        paginaAtual: 1,
        totalRegistros: 0,
        registrosPorPagina: 10,
      }),
    );
  });

  it("deve renderizar serviços ativos e inativos", () => {
    useListarServicosMock.mockReturnValue({
      data: {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            uuid: "uuid-ativo",
            nome: "Pintura",
            status: true,
          },
          {
            id: 2,
            uuid: "uuid-inativo",
            nome: "Controle de pragas",
            status: false,
          },
        ],
      },
    });

    render(<ListarServico />);

    expect(screen.getByText("Pintura")).toBeInTheDocument();

    expect(screen.getByText("Controle de pragas")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Editar Pintura",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Editar Controle de pragas",
      }),
    ).toBeInTheDocument();

    expect(screen.queryByTestId("lista-vazia")).not.toBeInTheDocument();

    expect(paginacaoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        totalRegistros: 2,
      }),
    );
  });

  it("deve buscar serviços pelo nome", () => {
    render(<ListarServico />);

    const campoNome = screen.getByLabelText("Nome");
    const botaoBuscar = screen.getByRole("button", {
      name: "Buscar serviços",
    });

    fireEvent.change(campoNome, {
      target: {
        value: "   ",
      },
    });

    expect(botaoBuscar).toBeDisabled();

    fireEvent.change(campoNome, {
      target: {
        value: "  Pintura  ",
      },
    });

    expect(botaoBuscar).toBeEnabled();

    fireEvent.click(botaoBuscar);

    expect(obterUltimosFiltros()).toEqual({
      nome: "Pintura",
      status: undefined,
      page: 1,
      page_size: 10,
    });
  });

  it("deve buscar serviços ativos e inativos", () => {
    render(<ListarServico />);

    const botaoBuscar = screen.getByRole("button", {
      name: "Buscar serviços",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar valor inválido",
      }),
    );

    expect(botaoBuscar).toBeDisabled();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar ativo",
      }),
    );

    expect(botaoBuscar).toBeEnabled();

    fireEvent.click(botaoBuscar);

    expect(obterUltimosFiltros()).toEqual({
      nome: undefined,
      status: true,
      page: 1,
      page_size: 10,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Selecionar inativo",
      }),
    );

    fireEvent.click(botaoBuscar);

    expect(obterUltimosFiltros()).toEqual({
      nome: undefined,
      status: false,
      page: 1,
      page_size: 10,
    });
  });

  it("deve limpar os filtros preenchidos", () => {
    render(<ListarServico />);

    const campoNome = screen.getByLabelText("Nome");

    fireEvent.change(campoNome, {
      target: {
        value: "Pintura",
      },
    });

    const botaoLimpar = screen.getByRole("button", {
      name: "Limpar filtros",
    });

    expect(botaoLimpar).toBeEnabled();

    fireEvent.click(botaoLimpar);

    expect(campoNome).toHaveValue("");

    expect(screen.getByTestId("select-status")).toHaveAttribute(
      "data-value",
      "",
    );

    expect(obterUltimosFiltros()).toEqual({
      page: 1,
      page_size: 10,
    });
  });

  it("deve mudar a página atual", () => {
    useListarServicosMock.mockReturnValue({
      data: {
        count: 30,
        next: "/servicos/?page=2",
        previous: null,
        results: [],
      },
    });

    render(<ListarServico />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ir para página 2",
      }),
    );

    expect(obterUltimosFiltros()).toEqual({
      page: 2,
      page_size: 10,
    });

    expect(paginacaoMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        paginaAtual: 2,
        registrosPorPagina: 10,
      }),
    );
  });

  it("deve mudar a quantidade de registros por página", () => {
    useListarServicosMock.mockReturnValue({
      data: {
        count: 30,
        next: "/servicos/?page=2",
        previous: null,
        results: [],
      },
    });

    render(<ListarServico />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Mostrar 20",
      }),
    );

    expect(obterUltimosFiltros()).toEqual({
      page: 1,
      page_size: 20,
    });

    expect(paginacaoMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        paginaAtual: 1,
        registrosPorPagina: 20,
      }),
    );
  });
});
