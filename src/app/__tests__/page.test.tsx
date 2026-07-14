import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "../page";

describe("Home", () => {
  it("deve renderizar os textos principais da página", () => {
    render(<Home />);

    expect(screen.getByText("Status da API")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /health check/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("O endpoint retornou:"),
    ).toBeInTheDocument();
  });

  it("deve renderizar o botão para cadastrar fornecedor", () => {
    render(<Home />);

    expect(
      screen.getByRole("button", {
        name: /cadastrar fornecedor/i,
      }),
    ).toBeInTheDocument();
  });
});