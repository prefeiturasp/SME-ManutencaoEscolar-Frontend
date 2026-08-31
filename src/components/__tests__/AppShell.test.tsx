import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/layout/AppShell";

vi.mock("@/components/layout/Sidebar", () => ({
  Sidebar: ({ open, onToggle }: { open: boolean; onToggle: () => void }) => (
    <aside data-testid="sidebar" data-open={String(open)}>
      <button type="button" onClick={onToggle}>
        Alternar sidebar
      </button>
    </aside>
  ),
}));

vi.mock("@/components/layout/Header", () => ({
  PageHeader: ({ abrirSidebar }: { abrirSidebar: boolean }) => (
    <header
      data-testid="page-header"
      data-sidebar-aberta={String(abrirSidebar)}
    >
      Cabeçalho
    </header>
  ),
}));

vi.mock("@/components/layout/Footer", () => ({
  Footer: () => <footer>Rodapé da aplicação</footer>,
}));

vi.mock("@/components/ui/sonner", () => ({
  Toaster: ({
    position,
    offset,
    icons,
  }: {
    position: string;
    offset: {
      top: number;
      right: number;
    };
    icons: {
      close: ReactNode;
    };
  }) => (
    <div
      data-testid="toaster"
      data-position={position}
      data-offset-top={offset.top}
      data-offset-right={offset.right}
    >
      <div data-testid="icone-fechar-toast">{icons.close}</div>
    </div>
  ),
}));

describe("AppShell", () => {
  it("renderiza a estrutura principal da aplicação", () => {
    render(
      <AppShell>
        <h1>Conteúdo da página</h1>
      </AppShell>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Conteúdo da página",
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("page-header")).toBeInTheDocument();

    expect(screen.getByText("Rodapé da aplicação")).toBeInTheDocument();

    expect(screen.getByTestId("toaster")).toBeInTheDocument();
  });

  it("inicia com a sidebar fechada", () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "false");

    expect(screen.getByTestId("page-header")).toHaveAttribute(
      "data-sidebar-aberta",
      "false",
    );

    const main = screen.getByRole("main");
    const containerConteudo = main.parentElement;

    expect(containerConteudo).toHaveClass("ml-20");
    expect(containerConteudo).not.toHaveClass("ml-65");
  });

  it("abre a sidebar e altera a margem do conteúdo", () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alternar sidebar",
      }),
    );

    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "true");

    expect(screen.getByTestId("page-header")).toHaveAttribute(
      "data-sidebar-aberta",
      "true",
    );

    const main = screen.getByRole("main");
    const containerConteudo = main.parentElement;

    expect(containerConteudo).toHaveClass("ml-65");
    expect(containerConteudo).not.toHaveClass("ml-20");
  });

  it("fecha novamente a sidebar", () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    const botaoAlternar = screen.getByRole("button", {
      name: "Alternar sidebar",
    });

    fireEvent.click(botaoAlternar);

    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "true");

    fireEvent.click(botaoAlternar);

    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-open", "false");

    expect(screen.getByTestId("page-header")).toHaveAttribute(
      "data-sidebar-aberta",
      "false",
    );

    const main = screen.getByRole("main");
    const containerConteudo = main.parentElement;

    expect(containerConteudo).toHaveClass("ml-20");
    expect(containerConteudo).not.toHaveClass("ml-65");
  });

  it("configura corretamente o toaster", () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    const toaster = screen.getByTestId("toaster");

    expect(toaster).toHaveAttribute("data-position", "top-right");

    expect(toaster).toHaveAttribute("data-offset-top", "102");

    expect(toaster).toHaveAttribute("data-offset-right", "20");
  });

  it("fornece o ícone personalizado de fechar para o toaster", () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    const containerIcone = screen.getByTestId("icone-fechar-toast");

    const icone = containerIcone.querySelector("svg");

    expect(icone).toBeInTheDocument();
    expect(icone).toHaveClass("mt-6", "size-6", "text-[#4B5052]");

    expect(icone).toHaveAttribute("stroke-width", "2.5");
  });

  it("aplica as classes estruturais no layout", () => {
    const { container } = render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    const raiz = container.firstElementChild;

    expect(raiz).toHaveClass(
      "flex",
      "min-h-dvh",
      "flex-col",
      "overflow-x-hidden",
    );

    expect(screen.getByRole("main")).toHaveClass("flex-1", "p-8");

    expect(screen.getByRole("main").parentElement).toHaveClass(
      "flex",
      "flex-1",
      "flex-col",
      "transition-[margin]",
      "duration-300",
    );
  });
});
