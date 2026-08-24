import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ListarLotes } from "@/features/lotes/components/ListarLotes";

vi.mock("@/components/icons/plus", () => ({
  PlusIcon: () => (
    <svg data-testid="plus-icon" aria-label="Ícone de adicionar" />
  ),
}));

describe("ListarLotes", () => {
  it("renderiza o título da página", () => {
    render(<ListarLotes />);

    expect(
      screen.getByRole("heading", {
        name: "Lotes",
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it("renderiza o link para cadastrar lote", () => {
    render(<ListarLotes />);

    const linkCadastrar = screen.getByRole("link", {
      name: /Cadastrar lote/,
    });

    expect(linkCadastrar).toHaveAttribute("href", "/cadastro/lotes/cadastrar");

    expect(linkCadastrar).toHaveAttribute("data-variant", "default");

    expect(linkCadastrar).toHaveAttribute("data-size", "big-sm");
  });

  it("renderiza o ícone de adicionar lote", () => {
    render(<ListarLotes />);

    expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
  });
});
