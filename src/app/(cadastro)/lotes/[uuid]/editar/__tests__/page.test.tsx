import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EditarLotePage from "../page";

const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
  useBuscarLotePorUuid: vi.fn(),
  editarLoteForm: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: mocks.useParams,
}));

vi.mock("@/features/lotes/hooks/useLotes", () => ({
  useBuscarLotePorUuid: mocks.useBuscarLotePorUuid,
}));

vi.mock("@/app/(cadastro)/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => <nav aria-label="breadcrumb">Breadcrumb</nav>,
}));

vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: ({
    titulo,
    mensagem,
  }: {
    titulo?: string;
    mensagem?: string;
  }) => (
    <div role="status">
      <p>{titulo}</p>
      <p>{mensagem}</p>
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
    <div>
      <h2>{titulo}</h2>
      <p>{descricao}</p>

      {textoBotao && href && <a href={href}>{textoBotao}</a>}
    </div>
  ),
}));

vi.mock("@/features/lotes/components/EditarLoteForm", () => ({
  EditarLoteForm: (props: unknown) => {
    mocks.editarLoteForm(props);

    return <div>Formulário de edição de lote</div>;
  },
}));

const uuid = "8dd89697-1ab6-4933-a480-d859a012245d";

const lote = {
  id: 39,
  uuid,
  codigo_cadastro: "Lote 2",
  nome: "Lote 2",
  status: true,
  empresa: {
    id: 2,
    uuid: "f882ef71-1705-46cb-850b-c404650d95e5",
    nome: "Empresa 2",
    cnpj: "40715305000102",
    status: true,
    razao_social: "Empresa 2",
    link_rastreio: "",
    cep: "13197414",
    logradouro: "XPTO",
    numero: "120",
    complemento: "",
    cidade: "Campinas",
    estado: "PI",
    criado_por: "ESCOLA EMEF ADMIN",
    criado_em: "2026-08-20T18:54:20.650700-03:00",
    atualizado_por: null,
    atualizado_em: "2026-08-20T18:54:20.650905-03:00",
    responsaveis_tecnicos: [],
  },
  periodo_inicial: "2026-09-01",
  periodo_final: "2026-09-17",
  diretorias_regionais: [
    {
      id: 4,
      codigo: "108300",
      nome: "DIRETORIA REGIONAL DE EDUCACAO CAPELA DO SOCORRO",
      abreviacao: "DRE - CS",
      nome_curto: "DRE CAPELA DO SOCORRO",
    },
    {
      id: 12,
      codigo: "108400",
      nome: "DIRETORIA REGIONAL DE EDUCACAO FREGUESIA/BRASILANDIA",
      abreviacao: "DRE - FB",
      nome_curto: "DRE FREGUESIA/BRASILANDIA",
    },
  ],
  criado_por: 1,
  criado_por_nome: "ESCOLA EMEF ADMIN",
  criado_em: "2026-09-01T17:36:28.047630-03:00",
  atualizado_por: 1,
  atualizado_por_nome: "ESCOLA EMEF ADMIN",
  username: "44331733637",
  atualizado_em: "2026-09-01T17:36:28.047669-03:00",
};

describe("EditarLotePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useParams.mockReturnValue({ uuid });
  });

  it("deve exibir o carregamento enquanto busca o lote", () => {
    mocks.useBuscarLotePorUuid.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<EditarLotePage />);

    expect(
      screen.getByRole("navigation", {
        name: "breadcrumb",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Aguarde um momento!")).toBeInTheDocument();

    expect(
      screen.getByText("Estamos carregando as informações..."),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Formulário de edição de lote"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Não encontramos esta página"),
    ).not.toBeInTheDocument();
  });

  it("deve exibir a mensagem quando ocorrer erro na busca", () => {
    mocks.useBuscarLotePorUuid.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<EditarLotePage />);

    expect(screen.getByText("Não encontramos esta página")).toBeInTheDocument();

    expect(
      screen.getByText(/A página que você procura não está disponível/),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cadastro de Lotes",
      }),
    ).toHaveAttribute("href", "/lotes");

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    expect(
      screen.queryByText("Formulário de edição de lote"),
    ).not.toBeInTheDocument();
  });

  it("deve exibir a mensagem quando o lote não for encontrado", () => {
    mocks.useBuscarLotePorUuid.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    render(<EditarLotePage />);

    expect(screen.getByText("Não encontramos esta página")).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cadastro de Lotes",
      }),
    ).toHaveAttribute("href", "/lotes");

    expect(
      screen.queryByText("Formulário de edição de lote"),
    ).not.toBeInTheDocument();
  });

  it("deve exibir o formulário quando o lote for carregado", () => {
    mocks.useBuscarLotePorUuid.mockReturnValue({
      data: lote,
      isLoading: false,
      isError: false,
    });

    render(<EditarLotePage />);

    expect(
      screen.getByText("Formulário de edição de lote"),
    ).toBeInTheDocument();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    expect(
      screen.queryByText("Não encontramos esta página"),
    ).not.toBeInTheDocument();

    expect(mocks.editarLoteForm).toHaveBeenCalledWith({
      uuid,
      lote,
    });
  });

  it("deve buscar o lote usando o UUID da rota", () => {
    mocks.useBuscarLotePorUuid.mockReturnValue({
      data: lote,
      isLoading: false,
      isError: false,
    });

    render(<EditarLotePage />);

    expect(mocks.useBuscarLotePorUuid).toHaveBeenCalledTimes(1);
    expect(mocks.useBuscarLotePorUuid).toHaveBeenCalledWith(uuid);
  });
});
