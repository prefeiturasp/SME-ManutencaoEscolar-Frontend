import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DomainBreadcrumb } from "../DomainBreadcrumb";

type ItemBreadcrumb = {
  rotulo: string;
  caminho?: string;
  paginaAtual?: boolean;
  icone?: ReactNode;
};

const { breadcrumbMock, pathnameMock } = vi.hoisted(() => ({
  breadcrumbMock: vi.fn(),
  pathnameMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

vi.mock("../Breadcrumb", () => ({
  Breadcrumb: ({ itens }: { itens: ItemBreadcrumb[] }) => {
    breadcrumbMock({ itens });

    return <nav aria-label="breadcrumb" />;
  },
}));

vi.mock("@/components/icons/HomeIcon", () => ({
  HomeIcon: () => <svg data-testid="home-icon" />,
}));

const dominios = {
  servicos: {
    rotuloPlural: "Serviços",
    rotuloSingular: "Serviço",
  },
  empresas: {
    rotuloPlural: "Empresas",
    rotuloSingular: "Empresa",
  },
};

describe("DomainBreadcrumb", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve montar breadcrumb de listagem do domínio", () => {
    pathnameMock.mockReturnValue("/cadastro/servicos");

    render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    expect(
      screen.getByRole("navigation", { name: "breadcrumb" }),
    ).toBeInTheDocument();

    const itens = breadcrumbMock.mock.calls.at(-1)?.[0]
      .itens as ItemBreadcrumb[];

    expect(itens).toHaveLength(3);
    expect(itens[0]).toEqual(
      expect.objectContaining({ rotulo: "Início", caminho: "/" }),
    );
    expect(itens[1]).toEqual(
      expect.objectContaining({
        rotulo: "Cadastro",
        caminho: "/cadastro",
      }),
    );
    expect(itens[2]).toEqual(
      expect.objectContaining({ rotulo: "Serviços", paginaAtual: true }),
    );
  });

  it("deve montar breadcrumb de cadastro do domínio", () => {
    pathnameMock.mockReturnValue("/cadastro/empresas/cadastrar");

    render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    const itens = breadcrumbMock.mock.calls.at(-1)?.[0]
      .itens as ItemBreadcrumb[];

    expect(itens).toHaveLength(4);
    expect(itens[2]).toEqual(
      expect.objectContaining({
        rotulo: "Empresas",
        caminho: "/cadastro/empresas",
      }),
    );
    expect(itens[3]).toEqual(
      expect.objectContaining({
        rotulo: "Cadastrar Empresa",
        paginaAtual: true,
      }),
    );
  });

  it("deve normalizar caminhos com barra final e formatar segmentos sem configuração", () => {
    pathnameMock.mockReturnValue("/cadastro/empresas/novo-cadastro/");

    render(
      <DomainBreadcrumb
        basePath="/cadastro/"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    const itens = breadcrumbMock.mock.calls.at(-1)?.[0]
      .itens as ItemBreadcrumb[];

    expect(itens).toHaveLength(4);
    expect(itens[2]).toEqual(
      expect.objectContaining({
        rotulo: "Empresas",
        caminho: "/cadastro/empresas",
      }),
    );
    expect(itens[3]).toEqual(
      expect.objectContaining({
        rotulo: "Novo Cadastro",
        paginaAtual: true,
      }),
    );
  });

  it("deve usar o fallback para o rótulo singular sem configuração explícita", () => {
    pathnameMock.mockReturnValue("/cadastro/servicos/cadastrar");

    render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={{ servicos: { rotuloPlural: "Serviços" } }}
      />,
    );

    const itens = breadcrumbMock.mock.calls.at(-1)?.[0]
      .itens as ItemBreadcrumb[];

    expect(itens[3]).toEqual(
      expect.objectContaining({
        rotulo: "Cadastrar Servico",
        paginaAtual: true,
      }),
    );
  });

  it("deve não renderizar quando pathname não existe", () => {
    pathnameMock.mockReturnValue(undefined);

    const { container } = render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("deve não renderizar fora do caminho base", () => {
    pathnameMock.mockReturnValue("/");

    const { container } = render(
      <DomainBreadcrumb
        basePath="/cadastro"
        baseLabel="Cadastro"
        domains={dominios}
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(breadcrumbMock).not.toHaveBeenCalled();
  });
});
