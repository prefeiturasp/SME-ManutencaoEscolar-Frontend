import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EquipeLista } from "../components/EquipeLista";

describe("EquipeLista", () => {
  it("exibe o título, a descrição e o link para cadastrar uma equipe", () => {
    render(<EquipeLista />);
    expect(screen.getByRole("heading", { name: "Equipes" })).toBeInTheDocument();
    expect(screen.getByText("Equipes cadastradas")).toBeInTheDocument();
    expect(
      screen.getByText("Estas são as equipes que já estão cadastradas no sistema."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cadastrar equipe" })).toHaveAttribute(
      "href",
      "/empresas/equipes/cadastrar",
    );
  });
});
