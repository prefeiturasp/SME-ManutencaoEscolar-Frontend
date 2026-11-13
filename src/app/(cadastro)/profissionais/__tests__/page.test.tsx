import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ProfissionaisPage from "../page";

vi.mock("@/app/(cadastro)/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => <nav aria-label="Breadcrumb de cadastro" />,
}));

vi.mock("@/features/profissional/components/list/ProfissionalLista", () => ({
  ProfissionalLista: () => (
    <main>
      <h1>Profissionais</h1>
      <a href="/profissionais/cadastrar">Cadastrar profissional</a>
    </main>
  ),
}));

describe("ProfissionaisPage", () => {
  it("exibe o breadcrumb e o título da página", () => {
    render(<ProfissionaisPage />);

    expect(
      screen.getByRole("navigation", { name: "Breadcrumb de cadastro" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Profissionais" }),
    ).toBeInTheDocument();
  });

  it("oferece um link para cadastrar profissional", () => {
    render(<ProfissionaisPage />);

    expect(
      screen.getByRole("link", { name: "Cadastrar profissional" }),
    ).toHaveAttribute("href", "/profissionais/cadastrar");
  });
});
