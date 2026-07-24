import type React from "react";

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CadastroPage from "../page";

vi.mock("@/components/navigation/Breadcrumb/Breadcrumb", () => ({
  Breadcrumb: vi.fn(
    ({
      itens,
    }: {
      itens: Array<{
        rotulo: string;
        caminho?: string;
        paginaAtual?: boolean;
        icone?: React.ReactNode;
      }>;
    }) => (
      <nav aria-label="breadcrumb">
        {itens.map((item) => (
          <span key={item.rotulo}>
            {item.icone}
            {item.rotulo}
          </span>
        ))}
      </nav>
    ),
  ),
}));

vi.mock("@/components/icons/HomeIcon", () => ({
  HomeIcon: ({ className }: { className?: string }) => (
    <svg
      data-testid="home-icon"
      className={className}
      aria-label="Ícone de início"
    />
  ),
}));

describe("CadastroPage", () => {
  it("deve renderizar o título da página", () => {
    render(<CadastroPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Cadastro",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar o breadcrumb com Início e Cadastro", () => {
    render(<CadastroPage />);

    const breadcrumb = screen.getByRole("navigation", {
      name: "breadcrumb",
    });

    expect(breadcrumb).toBeInTheDocument();

    expect(within(breadcrumb).getByText("Início")).toBeInTheDocument();
    expect(within(breadcrumb).getByText("Cadastro")).toBeInTheDocument();
  });

  it("deve renderizar o ícone de início", () => {
    render(<CadastroPage />);

    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
  });

  it("deve aplicar a classe de tamanho no ícone de início", () => {
    render(<CadastroPage />);

    expect(screen.getByTestId("home-icon")).toHaveClass("size-4");
  });
});
