import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/icons/plus", () => ({
  PlusIcon: () => <span data-testid="icone-adicionar-cargo" />,
}));

import { ListarCargo } from "@/features/cargo/components/ListarCargo";

describe("ListarCargo", () => {
  it("renderiza o título e o link para cadastrar cargo", () => {
    render(<ListarCargo />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Cargos",
      }),
    ).toBeInTheDocument();

    const linkCadastrar = screen.getByRole("link", {
      name: /cadastrar cargo/i,
    });

    expect(linkCadastrar).toBeInTheDocument();
    expect(linkCadastrar).toHaveAttribute("href", "/cargos/cadastrar");

    expect(screen.getByTestId("icone-adicionar-cargo")).toBeInTheDocument();
  });
});
