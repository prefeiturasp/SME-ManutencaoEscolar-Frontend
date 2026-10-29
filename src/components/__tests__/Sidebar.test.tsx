import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Sidebar } from "@/components/layout/Sidebar";
import { FUNCIONALIDADES, type Funcionalidade } from "@/constants/funcionalidades";
import { useUsuarioStore } from "@/stores/useUsuarioStore";

const TODAS_FUNCIONALIDADES = Object.values(FUNCIONALIDADES);

function definirFuncionalidades(funcionalidades: Funcionalidade[]) {
  useUsuarioStore.setState({
    usuario: {
      nome: "Maria Souza",
      codigoRfOuCpf: "1234567",
      cargo: "Cargo",
      diretoriaRegional: null,
      unidadeEducacional: null,
      funcionalidades,
    },
  });
}

beforeEach(() => {
  localStorage.clear();
  definirFuncionalidades(TODAS_FUNCIONALIDADES);
});

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & {}) => {
    return <img alt={alt ?? ""} {...props} />;
  },
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    href: string;
  }) => (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        event.preventDefault();
        props.onClick?.(event);
      }}
    >
      {children}
    </a>
  ),
}));

describe("Sidebar", () => {
  it.each([true, false])("navega para solicitações e fecha somente quando aberta: %s", (open) => {
    const onToggle = vi.fn();
    render(<Sidebar open={open} onToggle={onToggle} />);
    const link = screen.getByRole("link", { name: "Solicitação" });
    expect(link).toHaveAttribute("href", "/solicitacao_manutencao");
    fireEvent.click(link);
    expect(onToggle).toHaveBeenCalledTimes(open ? 1 : 0);
  });
  it("fecha o submenu de empresas ao navegar em Equipes", () => {
    const onToggle = vi.fn();
    render(<Sidebar open onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("button", { name: "Cadastro" }));
    fireEvent.click(screen.getByRole("button", { name: "Empresas" }));
    fireEvent.click(screen.getByRole("button", { name: "Empresas" }));
    expect(screen.queryByRole("link", { name: "Equipes" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Empresas" }));
    fireEvent.click(screen.getByRole("link", { name: "Equipes" }));
    expect(onToggle).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Cadastro" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
  it("deve renderizar a sidebar fechada", () => {
    const onToggle = vi.fn();

    const { container } = render(<Sidebar open={false} onToggle={onToggle} />);

    const sidebar = container.querySelector("aside");

    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass("w-[80px]");

    expect(screen.getByRole("button", { name: /abrir menu/i })).toBeInTheDocument();

    expect(screen.queryByAltText("Manutenção Escolar")).not.toBeInTheDocument();
  });

  it("deve renderizar a sidebar aberta", () => {
    const onToggle = vi.fn();

    const { container } = render(<Sidebar open onToggle={onToggle} />);

    const sidebar = container.querySelector("aside");

    expect(sidebar).toHaveClass("w-[260px]");

    expect(screen.getByRole("button", { name: /^fechar menu$/i })).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /fechar menu ao clicar fora/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByAltText("Manutenção Escolar")).toBeInTheDocument();
  });

  it("deve chamar onToggle ao clicar no botão principal da sidebar", () => {
    const onToggle = vi.fn();

    render(<Sidebar open={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: /abrir menu/i }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("deve abrir o submenu de cadastro quando a sidebar estiver aberta", () => {
    const onToggle = vi.fn();

    render(<Sidebar open onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: /cadastro/i }));

    expect(screen.queryByRole("link", { name: "Empresas" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Empresas" }));

    expect(screen.getByRole("link", { name: "Empresas" })).toHaveAttribute("href", "/empresas");
    expect(screen.getByRole("link", { name: "Equipes" })).toHaveAttribute(
      "href",
      "/empresas/equipes",
    );

    expect(screen.getByRole("link", { name: "Serviços" })).toHaveAttribute("href", "/servicos");
    expect(screen.getByRole("link", { name: "Lotes" })).toHaveAttribute("href", "/lotes");

    expect(screen.getByRole("link", { name: "Unidades Educacionais" })).toHaveAttribute(
      "href",
      "/unidades-educacionais",
    );
  });

  it("deve fechar o submenu ao clicar novamente em cadastro", () => {
    const onToggle = vi.fn();

    render(<Sidebar open onToggle={onToggle} />);

    const cadastroButton = screen.getByRole("button", {
      name: /cadastro/i,
    });

    fireEvent.click(cadastroButton);

    expect(screen.getByRole("button", { name: "Empresas" })).toBeInTheDocument();
    fireEvent.click(cadastroButton);
    expect(screen.queryByRole("button", { name: "Empresas" })).not.toBeInTheDocument();
    expect(cadastroButton).toHaveAttribute("aria-expanded", "false");
  });

  it("deve abrir a sidebar e preparar o submenu quando cadastro for clicado com a sidebar fechada", () => {
    const onToggle = vi.fn();

    const { rerender } = render(<Sidebar open={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: /cadastro/i }));

    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(<Sidebar open onToggle={onToggle} />);
  });

  it("não deve exibir os links de cadastro inicialmente", () => {
    const onToggle = vi.fn();

    render(<Sidebar open onToggle={onToggle} />);

    expect(screen.queryByRole("link", { name: "Empresas" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Serviços" })).not.toBeInTheDocument();

    expect(screen.queryByRole("link", { name: "Lotes" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Unidades Educacionais" })).not.toBeInTheDocument();
  });

  it("deve aplicar o estilo ativo ao botão quando o submenu estiver aberto", () => {
    const onToggle = vi.fn();

    render(<Sidebar open onToggle={onToggle} />);

    const cadastroButton = screen.getByRole("button", {
      name: /cadastro/i,
    });

    fireEvent.click(cadastroButton);

    expect(cadastroButton).toHaveClass("bg-white");
    expect(cadastroButton).toHaveClass("text-secondary");
  });

  it("deve fechar o submenu Cadastro ao clicar no botão de fechar", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<Sidebar open onToggle={onToggle} />);

    await user.click(screen.getByRole("button", { name: /cadastro/i }));

    await user.click(screen.getByRole("button", { name: /^fechar menu$/i }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("deve fechar a sidebar ao clicar fora dela", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<Sidebar open onToggle={onToggle} />);

    await user.click(screen.getByRole("button", { name: /cadastro/i }));

    await user.click(
      screen.getByRole("button", {
        name: /fechar menu ao clicar fora/i,
      }),
    );

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("deve fechar a sidebar ao clicar em um link do submenu", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<Sidebar open onToggle={onToggle} />);

    await user.click(
      screen.getByRole("button", {
        name: /cadastro/i,
      }),
    );

    const servicosLink = screen.getByRole("link", {
      name: "Serviços",
    });

    expect(servicosLink).toBeInTheDocument();

    await user.click(servicosLink);

    expect(onToggle).toHaveBeenCalledTimes(1);

    expect(
      screen.queryByRole("link", {
        name: "Serviços",
      }),
    ).not.toBeInTheDocument();
  });
});

describe("Sidebar - permissões por perfil", () => {
  const perfis: [string, Funcionalidade[], boolean, boolean][] = [
    ["GME/SME", TODAS_FUNCIONALIDADES, true, true],
    ["DRE", ["SOLICITACAO_MANUTENCAO", "RELATORIOS"], false, true],
    ["UE", ["SOLICITACAO_MANUTENCAO", "RELATORIOS"], false, true],
    ["Empresa", ["SOLICITACAO_MANUTENCAO", "RELATORIOS"], false, true],
    ["sem cargo", [], false, false],
  ];

  it.each(perfis)(
    "perfil %s: cadastro=%s solicitação=%s",
    (_perfil, funcionalidades, exibeCadastro, exibeSolicitacao) => {
      definirFuncionalidades(funcionalidades);

      render(<Sidebar open onToggle={vi.fn()} />);

      expect(!!screen.queryByRole("button", { name: "Cadastro" })).toBe(exibeCadastro);
      expect(!!screen.queryByRole("link", { name: "Solicitação" })).toBe(exibeSolicitacao);
    },
  );

  it("não exibe nenhum item de navegação sem usuário autenticado", () => {
    useUsuarioStore.setState({ usuario: null });

    render(<Sidebar open onToggle={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Cadastro" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Solicitação" })).not.toBeInTheDocument();
  });

  it("perfil sem cadastros não consegue abrir os links de cadastro", () => {
    definirFuncionalidades(["SOLICITACAO_MANUTENCAO", "RELATORIOS"]);

    render(<Sidebar open onToggle={vi.fn()} />);

    expect(screen.queryByRole("link", { name: "Lotes" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Profissionais" })).not.toBeInTheDocument();
  });
});
