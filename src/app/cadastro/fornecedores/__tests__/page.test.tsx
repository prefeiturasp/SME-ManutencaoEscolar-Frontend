import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FornecedoresPage from "../page";

describe("FornecedoresPage", () => {
  it("deve renderizar o título e o botão de cadastro", () => {
    render(<FornecedoresPage />);

    expect(
      screen.getByRole("heading", { name: /fornecedores/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /cadastrar fornecedores/i }),
    ).toHaveAttribute("href", "/cadastro/fornecedores/cadastrar");
  });
});
