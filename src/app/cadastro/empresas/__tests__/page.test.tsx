import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EmpresasPage from "../page";

describe("EmpresasPage", () => {
  it("deve renderizar o título e o botão de cadastro", () => {
    render(<EmpresasPage />);

    expect(
      screen.getByRole("heading", { name: /empresas/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /cadastrar empresa/i }),
    ).toHaveAttribute("href", "/cadastro/empresas/cadastrar");
  });
});
