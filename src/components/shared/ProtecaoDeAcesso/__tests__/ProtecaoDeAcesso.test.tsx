import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FUNCIONALIDADES, type Funcionalidade } from "@/constants/funcionalidades";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { ProtecaoDeAcesso } from "../ProtecaoDeAcesso";

const { useUsuarioAutenticadoMock } = vi.hoisted(() => ({
  useUsuarioAutenticadoMock: vi.fn(),
}));

vi.mock("@/features/login/hooks/useUsuarioAutenticado", () => ({
  useUsuarioAutenticado: useUsuarioAutenticadoMock,
}));

vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: () => <div role="status">Carregando</div>,
}));

vi.mock("@/components/shared/ListaVazia/ListaVazia", () => ({
  ListaVazio: ({ titulo, href }: { titulo: string; href: string }) => <a href={href}>{titulo}</a>,
}));

function usuarioCom(funcionalidades: Funcionalidade[]) {
  return {
    nome: "Ana",
    codigoRfOuCpf: "1234567",
    cargo: "ADM",
    diretoriaRegional: null,
    unidadeEducacional: null,
    funcionalidades,
  };
}

function renderizar() {
  return render(
    <ProtecaoDeAcesso funcionalidade={FUNCIONALIDADES.CADASTROS}>
      <p>Conteúdo protegido</p>
    </ProtecaoDeAcesso>,
  );
}

describe("ProtecaoDeAcesso", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useUsuarioStore.setState({ usuario: null });
  });

  it("exibe o carregamento enquanto consulta o usuário", () => {
    useUsuarioAutenticadoMock.mockReturnValue({ data: undefined, isPending: true });

    renderizar();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo protegido")).not.toBeInTheDocument();
  });

  it("libera o conteúdo quando o perfil possui a funcionalidade", () => {
    useUsuarioAutenticadoMock.mockReturnValue({
      data: usuarioCom([FUNCIONALIDADES.CADASTROS]),
      isPending: false,
    });

    renderizar();

    expect(screen.getByText("Conteúdo protegido")).toBeInTheDocument();
  });

  it.each([
    ["sem a funcionalidade", usuarioCom([FUNCIONALIDADES.RELATORIOS])],
    ["sem funcionalidades", usuarioCom([])],
  ])("bloqueia o acesso para usuário %s", (_nome, usuario) => {
    useUsuarioAutenticadoMock.mockReturnValue({ data: usuario, isPending: false });

    renderizar();

    expect(screen.queryByText("Conteúdo protegido")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Você não tem permissão para acessar esta página" }),
    ).toHaveAttribute("href", "/");
  });

  it("usa o último usuário conhecido quando a consulta falha", () => {
    useUsuarioStore.setState({ usuario: usuarioCom([FUNCIONALIDADES.CADASTROS]) });
    useUsuarioAutenticadoMock.mockReturnValue({ data: undefined, isPending: false });

    renderizar();

    expect(screen.getByText("Conteúdo protegido")).toBeInTheDocument();
  });

  it("bloqueia o acesso quando a consulta falha e não há usuário salvo", () => {
    useUsuarioAutenticadoMock.mockReturnValue({ data: undefined, isPending: false });

    renderizar();

    expect(screen.queryByText("Conteúdo protegido")).not.toBeInTheDocument();
  });

  it("bloqueia o usuário salvo antes da existência das permissões", () => {
    useUsuarioStore.setState({
      usuario: { ...usuarioCom([]), funcionalidades: undefined } as never,
    });
    useUsuarioAutenticadoMock.mockReturnValue({ data: undefined, isPending: false });

    renderizar();

    expect(screen.queryByText("Conteúdo protegido")).not.toBeInTheDocument();
  });
});
