import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EditarServicoPage from "../page";

const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
  useBuscarServicoPorUuid: vi.fn(),
  editarServicoForm: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: mocks.useParams,
}));

vi.mock("@/features/servico/hooks/useListarServico", () => ({
  useBuscarServicoPorUuid: mocks.useBuscarServicoPorUuid,
}));

vi.mock("@/app/cadastro/CadastroBreadcrumb", () => ({
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

vi.mock("@/features/servico/components/Servico/EditarServicoForm", () => ({
  EditarServicoForm: (props: unknown) => {
    mocks.editarServicoForm(props);

    return <div>Formulário de edição</div>;
  },
}));

const uuid = "07f14275-59ee-4e67-812a-d5aaa2cedb62";

const servico = {
  id: 1,
  uuid,
  nome: "Pintura",
  status: true,
  criado_por: 1,
  criado_por_nome: "Matheus",
  criado_em: "2026-08-12T18:21:00Z",
  atualizado_por: 1,
  atualizado_por_nome: "Matheus",
  atualizado_em: "2026-08-13T11:02:00Z",
};

describe("EditarServicoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useParams.mockReturnValue({ uuid });
  });

  it("deve exibir o carregamento enquanto busca o serviço", () => {
    mocks.useBuscarServicoPorUuid.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<EditarServicoPage />);

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

    expect(screen.queryByText("Formulário de edição")).not.toBeInTheDocument();

    expect(
      screen.queryByText("Não encontramos esta página"),
    ).not.toBeInTheDocument();
  });

  it("deve exibir a mensagem quando ocorrer erro na busca", () => {
    mocks.useBuscarServicoPorUuid.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<EditarServicoPage />);

    expect(screen.getByText("Não encontramos esta página")).toBeInTheDocument();

    expect(
      screen.getByText(/A página que você procura não está disponível/),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cadastro de serviços",
      }),
    ).toHaveAttribute("href", "/cadastro/servicos");

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    expect(screen.queryByText("Formulário de edição")).not.toBeInTheDocument();
  });

  it("deve exibir a mensagem quando o serviço não for encontrado", () => {
    mocks.useBuscarServicoPorUuid.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    render(<EditarServicoPage />);

    expect(screen.getByText("Não encontramos esta página")).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cadastro de serviços",
      }),
    ).toHaveAttribute("href", "/cadastro/servicos");

    expect(screen.queryByText("Formulário de edição")).not.toBeInTheDocument();
  });

  it("deve exibir o formulário quando o serviço for carregado", () => {
    mocks.useBuscarServicoPorUuid.mockReturnValue({
      data: servico,
      isLoading: false,
      isError: false,
    });

    render(<EditarServicoPage />);

    expect(screen.getByText("Formulário de edição")).toBeInTheDocument();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    expect(
      screen.queryByText("Não encontramos esta página"),
    ).not.toBeInTheDocument();

    expect(mocks.editarServicoForm).toHaveBeenCalledWith({
      uuid,
      servico,
    });
  });

  it("deve buscar o serviço usando o UUID da rota", () => {
    mocks.useBuscarServicoPorUuid.mockReturnValue({
      data: servico,
      isLoading: false,
      isError: false,
    });

    render(<EditarServicoPage />);

    expect(mocks.useBuscarServicoPorUuid).toHaveBeenCalledTimes(1);
    expect(mocks.useBuscarServicoPorUuid).toHaveBeenCalledWith(uuid);
  });
});
