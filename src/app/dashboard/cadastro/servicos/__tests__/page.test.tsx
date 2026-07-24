import type React from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ServicosPage from "../page";

type BreadcrumbItem = {
  rotulo: string;
  caminho?: string;
  paginaAtual?: boolean;
  icone?: React.ReactNode;
};

type BreadcrumbProps = {
  itens: BreadcrumbItem[];
  className?: string;
};

const { breadcrumbMock } = vi.hoisted(() => ({
  breadcrumbMock: vi.fn(),
}));

vi.mock("@/components/navigation/Breadcrumb/Breadcrumb", () => ({
  Breadcrumb: ({ itens, className }: BreadcrumbProps) => {
    breadcrumbMock({ itens, className });

    return (
      <nav aria-label="breadcrumb" className={className}>
        {itens.map((item) => (
          <span key={item.rotulo}>
            {item.icone}
            {item.rotulo}
          </span>
        ))}
      </nav>
    );
  },
}));

vi.mock("@/components/icons/HomeIcon", () => ({
  HomeIcon: ({ className }: { className?: string }) => (
    <svg data-testid="home-icon" className={className} />
  ),
}));

vi.mock("@/components/icons/plus", () => ({
  PlusIcon: () => <svg data-testid="plus-icon" />,
}));

describe("ServicosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o título da página", () => {
    render(<ServicosPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Serviços",
      }),
    ).toBeInTheDocument();
  });

  it("deve enviar os itens corretos para o Breadcrumb", () => {
    render(<ServicosPage />);

    expect(breadcrumbMock).toHaveBeenCalled();

    const props = breadcrumbMock.mock.calls.at(-1)?.[0] as BreadcrumbProps;

    expect(props.className).toBe("mb-[32px]");
    expect(props.itens).toHaveLength(3);

    expect(props.itens[0]).toMatchObject({
      rotulo: "Início",
      caminho: "/dashboard",
    });

    expect(props.itens[1]).toMatchObject({
      rotulo: "Cadastro",
      caminho: "/dashboard/cadastro",
    });

    expect(props.itens[2]).toMatchObject({
      rotulo: "Serviços",
      paginaAtual: true,
    });

    expect(props.itens[0].icone).toBeDefined();
  });

  it("deve renderizar o link para cadastrar serviço", () => {
    render(<ServicosPage />);

    const link = screen.getByRole("link", {
      name: /cadastrar serviços/i,
    });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "/dashboard/cadastro/servicos/cadastrar",
    );
  });

  it("deve renderizar o ícone de adicionar no link", () => {
    render(<ServicosPage />);

    expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
  });

  it("deve aplicar a classe de tamanho ao ícone de início", () => {
    render(<ServicosPage />);

    expect(screen.getByTestId("home-icon")).toHaveClass("size-4");
  });
});
