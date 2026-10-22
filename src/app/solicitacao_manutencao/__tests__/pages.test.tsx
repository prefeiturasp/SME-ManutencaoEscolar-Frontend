import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import Layout from "../layout";
import Page from "../page";
import NovaPage from "../nova-solicitacao/page";

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock("@/components/navigation/Breadcrumb/DomainBreadcrumb", () => ({
  DomainBreadcrumb: ({ basePath, baseLabel }: { basePath: string; baseLabel: string }) => (
    <nav aria-label="Breadcrumb">
      <a href={basePath}>{baseLabel}</a>
    </nav>
  ),
}));
vi.mock("@/features/solicitacao_manutencao/components/form/CadastrarSolicitacaoPage", () => ({
  default: () => <h1>Formulário de solicitação</h1>,
}));

describe("rotas de solicitação", () => {
  it("oferece navegação para criar uma solicitação", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: "Solicitações de manutenção" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nova solicitação" })).toHaveAttribute(
      "href",
      "/solicitacao_manutencao/nova-solicitacao",
    );
  });
  it("renderiza o formulário na rota de cadastro", () => {
    render(<NovaPage />);
    expect(screen.getByRole("heading", { name: "Formulário de solicitação" })).toBeInTheDocument();
  });
  it("mantém o conteúdo dentro do AppShell e o breadcrumb de solicitações", () => {
    render(
      <Layout>
        <p>Conteúdo</p>
      </Layout>,
    );
    const conteudoAppShell = within(screen.getByRole("main"));
    expect(conteudoAppShell.getByText("Conteúdo")).toBeInTheDocument();
    const breadcrumb = conteudoAppShell.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(breadcrumb).getByRole("link", { name: "Solicitações" })).toHaveAttribute(
      "href",
      "/solicitacao_manutencao",
    );
  });
});
