import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormError } from "../FormError";

describe("FormError", () => {
  it("deve renderizar null quando message não existe", () => {
    const { container } = render(<FormError />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("deve renderizar null quando message é string vazia", () => {
    const { container } = render(<FormError message="" />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("deve renderizar mensagem de erro quando message existe", () => {
    render(<FormError message="Campo obrigatório" />);

    const alert = screen.getByRole("alert");

    expect(alert).toHaveTextContent("Campo obrigatório");
    expect(alert).toHaveClass("text-xs", "text-destructive");
  });
});
