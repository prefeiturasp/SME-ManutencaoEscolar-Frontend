import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LotesPage from "@/app/(cadastro)/lotes/page";

vi.mock("@/app/(cadastro)/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => (
    <nav aria-label="Breadcrumb">Breadcrumb de cadastro</nav>
  ),
}));

vi.mock("@/features/lotes/components/ListarLotes", () => ({
  ListarLotes: () => (
    <section aria-label="Listagem de lotes">Listagem de lotes</section>
  ),
}));

describe("LotesPage", () => {
  it("renderiza o breadcrumb de cadastro", () => {
    render(<LotesPage />);

    expect(
      screen.getByRole("navigation", {
        name: "Breadcrumb",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Breadcrumb de cadastro")).toBeInTheDocument();
  });

  it("renderiza a listagem de lotes", () => {
    render(<LotesPage />);

    expect(
      screen.getByRole("region", {
        name: "Listagem de lotes",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Listagem de lotes")).toBeInTheDocument();
  });

  it("renderiza todos os componentes da página", () => {
    render(<LotesPage />);

    expect(
      screen.getByRole("navigation", {
        name: "Breadcrumb",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("region", {
        name: "Listagem de lotes",
      }),
    ).toBeInTheDocument();
  });
});
