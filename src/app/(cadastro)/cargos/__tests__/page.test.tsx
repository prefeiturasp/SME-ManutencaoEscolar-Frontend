import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/(cadastro)/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => (
    <div data-testid="cadastro-breadcrumb">Breadcrumb de cadastro</div>
  ),
}));

vi.mock("@/features/cargo/components/ListarCargo", () => ({
  ListarCargo: () => <div data-testid="listar-cargo">Listagem de cargos</div>,
}));

import CargosPage from "../page";

describe("CargosPage", () => {
  it("renderiza o breadcrumb e a listagem de cargos", () => {
    render(<CargosPage />);

    expect(screen.getByTestId("cadastro-breadcrumb")).toBeInTheDocument();

    expect(screen.getByText("Breadcrumb de cadastro")).toBeInTheDocument();

    expect(screen.getByTestId("listar-cargo")).toBeInTheDocument();

    expect(screen.getByText("Listagem de cargos")).toBeInTheDocument();
  });
});
