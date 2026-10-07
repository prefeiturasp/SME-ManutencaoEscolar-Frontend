import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EquipesPage from "../page";

vi.mock("@/app/(cadastro)/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => <nav aria-label="Breadcrumb" />,
}));
vi.mock("@/features/equipe/components/EquipeLista", () => ({
  EquipeLista: () => <div>Lista de equipes</div>,
}));

describe("EquipesPage", () => {
  it("renderiza o breadcrumb e a lista de equipes", () => {
    render(<EquipesPage />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByText("Lista de equipes")).toBeInTheDocument();
  });
});
