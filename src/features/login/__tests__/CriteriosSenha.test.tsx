import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CriteriosSenha } from "../components/CriteriosSenha.tsx/CriteriosSenha";

describe("CriteriosSenha", () => {
  it("deve exibir os critérios sem ícones quando a senha estiver vazia", () => {
    const { container } = render(<CriteriosSenha senha="" />);

    expect(
      screen.getByText(
        "Por questões de segurança, a senha deve seguir os seguintes critérios:",
      ),
    ).toBeInTheDocument();

    expect(container.querySelectorAll("li")).toHaveLength(7);
    expect(container.querySelectorAll("svg")).toHaveLength(0);
  });

  it("deve exibir todos os critérios como válidos", () => {
    const { container } = render(<CriteriosSenha senha="Abcdef1@" />);

    expect(container.querySelectorAll(".lucide-circle-check")).toHaveLength(7);

    expect(container.querySelectorAll(".lucide-circle-x")).toHaveLength(0);
  });

  it("deve exibir todos os critérios como inválidos", () => {
    const { container } = render(<CriteriosSenha senha="á " />);

    expect(container.querySelectorAll(".lucide-circle-x")).toHaveLength(7);

    expect(container.querySelectorAll(".lucide-circle-check")).toHaveLength(0);
  });
});
