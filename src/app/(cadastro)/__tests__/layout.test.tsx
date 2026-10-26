import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CadastroLayout from "../layout";

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock("@/components/shared/ProtecaoDeAcesso/ProtecaoDeAcesso", () => ({
  ProtecaoDeAcesso: ({
    funcionalidade,
    children,
  }: {
    funcionalidade: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="protecao" data-funcionalidade={funcionalidade}>
      {children}
    </div>
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
    expect(screen.getByText("Conteúdo da página de cadastro")).toBeInTheDocument();
  });

  it("deve exigir a funcionalidade de cadastros para acessar as rotas", () => {
    render(
      <CadastroLayout>
        <div>Conteúdo da página de cadastro</div>
      </CadastroLayout>,
    );

    const protecao = screen.getByTestId("protecao");

    expect(protecao).toHaveAttribute("data-funcionalidade", "CADASTROS");
    expect(protecao).toContainElement(screen.getByText("Conteúdo da página de cadastro"));
  });
});
