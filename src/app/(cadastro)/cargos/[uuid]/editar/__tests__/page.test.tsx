import { render, screen } from "@testing-library/react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import EditarLotePage from "../page";

import { useBuscarCargoPorUuid } from "@/features/cargo/hooks/useListarCargo";

const mocks = vi.hoisted(() => ({
  uuid: "a6421bd7-a6e5-4883-a7c7-43cff161618a",
  editarCargoForm: vi.fn(),
  listaVazio: vi.fn(),
  loadingGlobal: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({
    uuid: mocks.uuid,
  }),
}));

vi.mock("@/features/cargo/hooks/useListarCargo", () => ({
  useBuscarCargoPorUuid: vi.fn(),
}));

vi.mock("@/app/(cadastro)/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => (
    <nav data-testid="cadastro-breadcrumb">Breadcrumb</nav>
  ),
}));

vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: (props: {
    exibir: boolean;
    titulo: string;
    mensagem: string;
  }) => {
    mocks.loadingGlobal(props);

    return props.exibir ? (
      <div data-testid="loading-global">
        <p>{props.titulo}</p>
        <p>{props.mensagem}</p>
      </div>
    ) : null;
  },
}));

vi.mock("@/components/shared/ListaVazia/ListaVazia", () => ({
  ListaVazio: (props: {
    titulo: string;
    descricao: string;
    textoBotao: string;
    href: string;
    primary?: boolean;
    icone?: unknown;
  }) => {
    mocks.listaVazio(props);

    return (
      <div data-testid="lista-vazia">
        <h2>{props.titulo}</h2>
        <p>{props.descricao}</p>
        <a href={props.href}>{props.textoBotao}</a>
      </div>
    );
  },
}));

vi.mock("@/features/cargo/components/EditarCargoForm", () => ({
  EditarCargoForm: (props: {
    uuid: string;
    cargo: {
      uuid?: string;
      nome: string;
    };
  }) => {
    mocks.editarCargoForm(props);

    return (
      <div data-testid="editar-cargo-form">Editando {props.cargo.nome}</div>
    );
  },
}));

const cargo = {
  id: 1,
  uuid: mocks.uuid,
  nome: "Engenheiro Eletricista",
  exige_documento: true,
  status: true,
  documentos: [
    {
      nome: "Certificado NR-10",
    },
  ],
  criado_por: 1,
  criado_por_nome: "Administrador",
  criado_em: "2026-09-17T18:00:00-03:00",
  atualizado_por: 1,
  atualizado_por_nome: "Administrador",
  username: "usuario.teste",
  atualizado_em: "2026-09-17T18:30:00-03:00",
};

type ResultadoHook = ReturnType<typeof useBuscarCargoPorUuid>;

function configurarHook({
  data,
  isLoading = false,
  isError = false,
}: {
  data: typeof cargo | undefined;
  isLoading?: boolean;
  isError?: boolean;
}) {
  vi.mocked(useBuscarCargoPorUuid).mockReturnValue({
    data,
    isLoading,
    isError,
  } as unknown as ResultadoHook);
}

describe("EditarLotePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    configurarHook({
      data: cargo,
    });
  });

  it("busca o cargo pelo UUID presente na rota", () => {
    render(<EditarLotePage />);

    expect(useBuscarCargoPorUuid).toHaveBeenCalledExactlyOnceWith(mocks.uuid);
  });

  it("exibe o breadcrumb em todos os estados da página", () => {
    render(<EditarLotePage />);

    expect(screen.getByTestId("cadastro-breadcrumb")).toBeInTheDocument();
  });

  it("exibe o carregamento enquanto consulta o cargo", () => {
    configurarHook({
      data: undefined,
      isLoading: true,
    });

    render(<EditarLotePage />);

    expect(screen.getByTestId("loading-global")).toBeInTheDocument();

    expect(screen.getByText("Aguarde um momento!")).toBeInTheDocument();

    expect(
      screen.getByText("Estamos carregando as informações..."),
    ).toBeInTheDocument();

    expect(mocks.loadingGlobal).toHaveBeenCalledExactlyOnceWith({
      exibir: true,
      titulo: "Aguarde um momento!",
      mensagem: "Estamos carregando as informações...",
    });

    expect(screen.queryByTestId("lista-vazia")).not.toBeInTheDocument();

    expect(screen.queryByTestId("editar-cargo-form")).not.toBeInTheDocument();
  });

  it("exibe a página não encontrada quando a consulta falha", () => {
    configurarHook({
      data: undefined,
      isError: true,
    });

    render(<EditarLotePage />);

    expect(screen.getByTestId("lista-vazia")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Não encontramos esta página",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/A página que você procura não está disponível/),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cadastro de Cargos",
      }),
    ).toHaveAttribute("href", "/cargos");

    expect(mocks.listaVazio).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        titulo: "Não encontramos esta página",
        descricao:
          "A página que você procura não está disponível ou o endereço pode estar incorreto.\nVolte para a tela anterior para continuar.",
        textoBotao: "Cadastro de Cargos",
        href: "/cargos",
        primary: true,
        icone: expect.anything(),
      }),
    );

    expect(screen.queryByTestId("loading-global")).not.toBeInTheDocument();

    expect(screen.queryByTestId("editar-cargo-form")).not.toBeInTheDocument();
  });

  it("exibe a página não encontrada quando o cargo não existe", () => {
    configurarHook({
      data: undefined,
      isError: false,
    });

    render(<EditarLotePage />);

    expect(screen.getByTestId("lista-vazia")).toBeInTheDocument();

    expect(screen.getByText("Não encontramos esta página")).toBeInTheDocument();

    expect(screen.queryByTestId("loading-global")).not.toBeInTheDocument();

    expect(screen.queryByTestId("editar-cargo-form")).not.toBeInTheDocument();
  });

  it("exibe o formulário quando encontra o cargo", () => {
    configurarHook({
      data: cargo,
      isLoading: false,
      isError: false,
    });

    render(<EditarLotePage />);

    expect(screen.getByTestId("editar-cargo-form")).toBeInTheDocument();

    expect(
      screen.getByText("Editando Engenheiro Eletricista"),
    ).toBeInTheDocument();

    expect(mocks.editarCargoForm).toHaveBeenCalledExactlyOnceWith({
      uuid: mocks.uuid,
      cargo,
    });

    expect(screen.queryByTestId("loading-global")).not.toBeInTheDocument();

    expect(screen.queryByTestId("lista-vazia")).not.toBeInTheDocument();
  });

  it("prioriza o carregamento mesmo quando a consulta contém erro", () => {
    configurarHook({
      data: undefined,
      isLoading: true,
      isError: true,
    });

    render(<EditarLotePage />);

    expect(screen.getByTestId("loading-global")).toBeInTheDocument();

    expect(screen.queryByTestId("lista-vazia")).not.toBeInTheDocument();

    expect(screen.queryByTestId("editar-cargo-form")).not.toBeInTheDocument();
  });
});
