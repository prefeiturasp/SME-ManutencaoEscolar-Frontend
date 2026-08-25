import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ServicosPage from "../page";

vi.mock("@/app/(cadastro)/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => <nav aria-label="Breadcrumb de cadastro" />,
}));

vi.mock("@/features/servico/components/Servico/ListarServico", () => ({
  ListarServico: () => (
    <div data-testid="listagem-servicos">Listagem de serviços</div>
  ),
}));

describe("ServicosPage", () => {
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

    expect(screen.getByTestId("listagem-servicos")).toHaveTextContent(
      "Listagem de serviços",
    );
  });
});
