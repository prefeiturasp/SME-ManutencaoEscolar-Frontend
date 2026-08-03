import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ServicosPage from "../page";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/app/cadastro/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => <nav aria-label="Breadcrumb de cadastro" />,
}));

vi.mock("../(listar)/page", () => ({
  default: () => (
    <div data-testid="listagem-servicos">Listagem de serviços</div>
  ),
}));

describe("ServicosPage", () => {
  it("deve renderizar os textos principais da página", () => {
    render(<ServicosPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Serviços",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Refine sua busca")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Utilize o filtro para localizar os serviços cadastrados.",
      ),
    ).toBeInTheDocument();
  });

  it("deve renderizar o link para cadastrar serviços", () => {
    render(<ServicosPage />);

    expect(
      screen.getByRole("link", {
        name: /cadastrar serviços/i,
      }),
    ).toHaveAttribute("href", "/cadastro/servicos/cadastrar");
  });

  it("deve renderizar o breadcrumb de cadastro", () => {
    render(<ServicosPage />);

    expect(
      screen.getByRole("navigation", {
        name: "Breadcrumb de cadastro",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar a listagem de serviços", () => {
    render(<ServicosPage />);

    expect(screen.getByTestId("listagem-servicos")).toBeInTheDocument();
  });
});
