import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CadastroLayout from "../layout";

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

describe("CadastroLayout", () => {
  it("deve renderizar os children dentro do AppShell", () => {
    render(
      <CadastroLayout>
        <div>Conteúdo da página de cadastro</div>
      </CadastroLayout>,
    );

    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
    expect(
      screen.getByText("Conteúdo da página de cadastro"),
    ).toBeInTheDocument();
  });
});
