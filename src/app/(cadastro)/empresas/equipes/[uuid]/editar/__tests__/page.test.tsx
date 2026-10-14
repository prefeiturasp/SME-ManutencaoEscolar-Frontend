import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EditarEquipePage from "../page";

const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
  useEquipe: vi.fn(),
  editarEquipeForm: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: mocks.useParams,
}));

vi.mock("@/features/equipe/hooks/useEquipes", () => ({
  useEquipe: mocks.useEquipe,
}));

vi.mock("@/app/(cadastro)/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => <nav aria-label="breadcrumb">Breadcrumb</nav>,
}));

vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: ({ titulo, mensagem }: { titulo?: string; mensagem?: string }) => (
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

vi.mock("@/features/equipe/components/form/EditarEquipeForm", () => ({
  EditarEquipeForm: (props: unknown) => {
    mocks.editarEquipeForm(props);

    return <div>Formulário de edição de equipe</div>;
  },
}));

const uuid = "8dd89697-1ab6-4933-a480-d859a012245d";

const equipe = {
  id: 1,
  uuid,
  nome: "Equipe de manuten??o",
  situacao: true,
  empresa: "empresa-1",
  lote: "lote-1",
  profissionais: [{ profissional: "profissional-1", funcao: "funcao-1" }],
};

describe("EditarEquipePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useParams.mockReturnValue({ uuid });
  });

  it("deve exibir o carregamento enquanto busca o equipe", () => {
    mocks.useEquipe.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<EditarEquipePage />);

    expect(
      screen.getByRole("navigation", {
        name: "breadcrumb",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Aguarde um momento!")).toBeInTheDocument();

    expect(screen.getByText("Estamos carregando as informações...")).toBeInTheDocument();

    expect(screen.queryByText("Formulário de edição de equipe")).not.toBeInTheDocument();

    expect(screen.queryByText("Não encontramos esta página")).not.toBeInTheDocument();
  });

  it("deve exibir a mensagem quando ocorrer erro na busca", () => {
    mocks.useEquipe.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<EditarEquipePage />);

    expect(screen.getByText("Não encontramos esta página")).toBeInTheDocument();

    expect(screen.getByText(/A página que você procura não está disponível/)).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cadastro de Equipes",
      }),
    ).toHaveAttribute("href", "/empresas/equipes");

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    expect(screen.queryByText("Formulário de edição de equipe")).not.toBeInTheDocument();
  });

  it("deve exibir a mensagem quando o equipe não for encontrado", () => {
    mocks.useEquipe.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    render(<EditarEquipePage />);

    expect(screen.getByText("Não encontramos esta página")).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cadastro de Equipes",
      }),
    ).toHaveAttribute("href", "/empresas/equipes");

    expect(screen.queryByText("Formulário de edição de equipe")).not.toBeInTheDocument();
  });

  it("deve exibir o formulário quando o equipe for carregado", () => {
    mocks.useEquipe.mockReturnValue({
      data: equipe,
      isLoading: false,
      isError: false,
    });

    render(<EditarEquipePage />);

    expect(screen.getByText("Formulário de edição de equipe")).toBeInTheDocument();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    expect(screen.queryByText("Não encontramos esta página")).not.toBeInTheDocument();

    expect(mocks.editarEquipeForm).toHaveBeenCalledWith({
      uuid,
      equipe,
    });
  });

  it("deve buscar o equipe usando o UUID da rota", () => {
    mocks.useEquipe.mockReturnValue({
      data: equipe,
      isLoading: false,
      isError: false,
    });

    render(<EditarEquipePage />);

    expect(mocks.useEquipe).toHaveBeenCalledTimes(1);
    expect(mocks.useEquipe).toHaveBeenCalledWith(uuid);
  });

  it("oculta dados anteriores quando a busca falha", () => {
    mocks.useEquipe.mockReturnValue({ data: equipe, isLoading: false, isError: true });
    render(<EditarEquipePage />);
    expect(screen.getByRole("link", { name: "Cadastro de Equipes" })).toHaveAttribute(
      "href",
      "/empresas/equipes",
    );
    expect(mocks.editarEquipeForm).not.toHaveBeenCalled();
  });

  it("prioriza o carregamento mesmo quando existem dados anteriores", () => {
    mocks.useEquipe.mockReturnValue({ data: equipe, isLoading: true, isError: false });
    render(<EditarEquipePage />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Cadastro de Equipes" })).not.toBeInTheDocument();
    expect(mocks.editarEquipeForm).not.toHaveBeenCalled();
  });
});
