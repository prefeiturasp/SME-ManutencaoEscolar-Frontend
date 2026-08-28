import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import UnidadesEducacionaisPage from "../page";

vi.mock("@/app/(cadastro)/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => <nav aria-label="Breadcrumb de cadastro" />,
}));

vi.mock("@/features/unidade_educacional/components/list/ListaUnidadeEducacional", () => ({
  UnidadeEducacionalLista: () => (
    <div data-testid="listagem-unidades">Listagem de Unidades Educacionais</div>
  ),
}));

describe("UnidadesEducacionaisPage", () => {
  it("deve renderizar o breadcrumb de cadastro", () => {
    render(<UnidadesEducacionaisPage />);

    expect(
      screen.getByRole("navigation", {
        name: "Breadcrumb de cadastro",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar a listagem de serviços", () => {
    render(<UnidadesEducacionaisPage />);

    expect(screen.getByTestId("listagem-unidades")).toHaveTextContent(
      "Listagem de Unidades Educacionais",
    );
  });
});
