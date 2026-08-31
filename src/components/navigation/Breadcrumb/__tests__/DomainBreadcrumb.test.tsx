import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DomainBreadcrumb } from "../DomainBreadcrumb";

type ItemBreadcrumbTeste = {
  rotulo: string;
  caminho?: string;
  paginaAtual?: boolean;
  icone?: ReactNode;
};

type PropriedadesBreadcrumbMock = {
  itens: ItemBreadcrumbTeste[];
  className?: string;
};

const mocks = vi.hoisted(() => ({
  pathname: vi.fn(),
  breadcrumb: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mocks.pathname,
}));

vi.mock("@/components/navigation/Breadcrumb/Breadcrumb", () => ({
  Breadcrumb: ({ itens, className }: PropriedadesBreadcrumbMock) => {
    mocks.breadcrumb({
      itens,
      className,
    });

    return <nav aria-label="breadcrumb" />;
  },
}));

vi.mock("@/components/icons/HomeIcon", () => ({
  HomeIcon: ({ className }: { className?: string }) => (
    <svg data-testid="home-icon" className={className} />
  ),
}));

const dominios = {
  servicos: {
    rotuloPlural: "Serviços",
    rotuloSingular: "Serviço",
  },
  empresas: {
    rotuloPlural: "Empresas",
    rotuloSingular: "Empresa",
    editar: "Alterar empresa",
  },
};

function obterPropriedadesBreadcrumb() {
  return mocks.breadcrumb.mock.calls.at(-1)?.[0] as PropriedadesBreadcrumbMock;
}

describe("DomainBreadcrumb", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("não deve renderizar quando o pathname não existir", () => {
    mocks.pathname.mockReturnValue(undefined);

    const { container } = render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(mocks.breadcrumb).not.toHaveBeenCalled();
  });

  it("não deve renderizar quando estiver fora do caminho base", () => {
    mocks.pathname.mockReturnValue("/");

    const { container } = render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(mocks.breadcrumb).not.toHaveBeenCalled();
  });

  it("não deve considerar um caminho apenas parecido com a base", () => {
    mocks.pathname.mockReturnValue("/cadastros");

    const { container } = render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(mocks.breadcrumb).not.toHaveBeenCalled();
  });

  it("deve normalizar barras finais e marcar a base como página atual", () => {
    mocks.pathname.mockReturnValue("/cadastro///");

    render(
      <DomainBreadcrumb
        basePath="/cadastro///"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    expect(
      screen.getByRole("navigation", {
        name: "breadcrumb",
      }),
    ).toBeInTheDocument();

    const { itens } = obterPropriedadesBreadcrumb();

    expect(itens).toHaveLength(2);

    expect(itens[0]).toEqual(
      expect.objectContaining({
        rotulo: "Início",
        caminho: "/",
      }),
    );

    expect(itens[0].icone).toBeDefined();

    expect(itens[1]).toEqual({
      rotulo: "Cadastro",
      paginaAtual: true,
    });
  });

  it("deve montar o breadcrumb de listagem do domínio", () => {
    mocks.pathname.mockReturnValue("/cadastro/servicos");

    render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    const { itens } = obterPropriedadesBreadcrumb();

    expect(itens).toHaveLength(3);

    expect(itens[0]).toEqual(
      expect.objectContaining({
        rotulo: "Início",
        caminho: "/",
      }),
    );

    expect(itens[1]).toEqual({
      rotulo: "Cadastro",
    });

    expect(itens[2]).toEqual({
      rotulo: "Serviços",
      paginaAtual: true,
    });
  });

  it("deve montar o breadcrumb de cadastro usando o singular configurado", () => {
    mocks.pathname.mockReturnValue("/cadastro/empresas/cadastrar");

    render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    const { itens } = obterPropriedadesBreadcrumb();

    expect(itens).toHaveLength(4);

    expect(itens[2]).toEqual({
      rotulo: "Empresas",
    });

    expect(itens[3]).toEqual({
      rotulo: "Cadastrar Empresa",
      paginaAtual: true,
    });
  });

  it("deve gerar o singular quando ele não estiver configurado", () => {
    mocks.pathname.mockReturnValue("/cadastro/servicos/cadastrar");

    render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={{
          servicos: {
            rotuloPlural: "Serviços",
          },
        }}
      />,
    );

    const { itens } = obterPropriedadesBreadcrumb();

    expect(itens[2]).toEqual({
      rotulo: "Serviços",
    });

    expect(itens[3]).toEqual({
      rotulo: "Cadastrar Servico",
      paginaAtual: true,
    });
  });

  it("deve formatar segmentos sem configuração de domínio", () => {
    mocks.pathname.mockReturnValue("/cadastro/outros/novo-cadastro/");

    render(
      <DomainBreadcrumb
        basePath="/cadastro/"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    const { itens } = obterPropriedadesBreadcrumb();

    expect(itens).toHaveLength(4);

    expect(itens[2]).toEqual({
      rotulo: "Outros",
    });

    expect(itens[3]).toEqual({
      rotulo: "Novo Cadastro",
      paginaAtual: true,
    });
  });

  it("deve usar Cadastrar sem singular para domínio desconhecido", () => {
    mocks.pathname.mockReturnValue("/cadastro/outros/cadastrar");

    render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    const { itens } = obterPropriedadesBreadcrumb();

    expect(itens).toHaveLength(4);

    expect(itens[2]).toEqual({
      rotulo: "Outros",
    });

    expect(itens[3]).toEqual({
      rotulo: "Cadastrar",
      paginaAtual: true,
    });
  });

  it("deve ocultar o UUID e usar o rótulo personalizado de edição", () => {
    const uuid = "07f14275-59ee-4e67-812a-d5aaa2cedb62";

    mocks.pathname.mockReturnValue(`/cadastro/empresas/${uuid}/editar`);

    render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    const { itens } = obterPropriedadesBreadcrumb();

    expect(itens).toHaveLength(4);

    expect(itens[2]).toEqual({
      rotulo: "Empresas",
    });

    expect(itens[3]).toEqual({
      rotulo: "Alterar empresa",
      paginaAtual: true,
    });

    expect(itens.some((item) => item.rotulo === uuid)).toBe(false);
  });

  it("deve usar o rótulo padrão de edição com o singular", () => {
    const uuid = "07f14275-59ee-4e67-812a-d5aaa2cedb62";

    mocks.pathname.mockReturnValue(`/cadastro/servicos/${uuid}/editar`);

    render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    const { itens } = obterPropriedadesBreadcrumb();

    expect(itens).toHaveLength(4);

    expect(itens[2]).toEqual({
      rotulo: "Serviços",
    });

    expect(itens[3]).toEqual({
      rotulo: "Editar Serviço",
      paginaAtual: true,
    });
  });

  it("deve usar apenas Editar para domínio desconhecido", () => {
    const uuid = "07f14275-59ee-4e67-812a-d5aaa2cedb62";

    mocks.pathname.mockReturnValue(`/cadastro/outros/${uuid}/editar`);

    render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    const { itens } = obterPropriedadesBreadcrumb();

    expect(itens).toHaveLength(4);

    expect(itens[2]).toEqual({
      rotulo: "Outros",
    });

    expect(itens[3]).toEqual({
      rotulo: "Editar",
      paginaAtual: true,
    });
  });

  it("deve utilizar os valores padrão das propriedades opcionais", () => {
    mocks.pathname.mockReturnValue("/cadastro/outros");

    render(<DomainBreadcrumb basePath="/cadastro" baseLabel="Cadastro" />);

    const propriedades = obterPropriedadesBreadcrumb();

    expect(propriedades.className).toBeUndefined();

    expect(propriedades.itens[0]).toEqual(
      expect.objectContaining({
        rotulo: "Início",
        caminho: "/",
      }),
    );

    expect(propriedades.itens[2]).toEqual({
      rotulo: "Outros",
      paginaAtual: true,
    });
  });

  it("deve repassar home e className personalizados", () => {
    mocks.pathname.mockReturnValue("/cadastro/outros");

    render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        homePath="/inicio"
        homeLabel="Página inicial"
        className="breadcrumb-personalizado"
      />,
    );

    const propriedades = obterPropriedadesBreadcrumb();

    expect(propriedades.className).toBe("breadcrumb-personalizado");

    expect(propriedades.itens[0]).toEqual(
      expect.objectContaining({
        rotulo: "Página inicial",
        caminho: "/inicio",
      }),
    );

    expect(propriedades.itens[2]).toEqual({
      rotulo: "Outros",
      paginaAtual: true,
    });
  });

  it("deve aceitar a raiz como caminho base", () => {
    mocks.pathname.mockReturnValue("/");

    render(<DomainBreadcrumb basePath="/" baseLabel="Página inicial" />);

    const { itens } = obterPropriedadesBreadcrumb();

    expect(itens).toHaveLength(2);

    expect(itens[1]).toEqual({
      rotulo: "Página inicial",
      paginaAtual: true,
    });
  });

  it("deve montar o breadcrumb de domínios que vivem na raiz, sem prefixo na URL", () => {
    mocks.pathname.mockReturnValue("/servicos/cadastrar");

    render(
      <DomainBreadcrumb basePath="/" baseLabel="Cadastro" domains={dominios} />,
    );

    const { itens } = obterPropriedadesBreadcrumb();

    expect(itens).toHaveLength(4);

    expect(itens[1]).toEqual({
      rotulo: "Cadastro",
    });

    expect(itens[2]).toEqual({
      rotulo: "Serviços",
    });

    expect(itens[3]).toEqual({
      rotulo: "Cadastrar Serviço",
      paginaAtual: true,
    });
  });
});
