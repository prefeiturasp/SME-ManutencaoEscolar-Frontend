import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/layout/AppShell";

vi.mock("@/components/layout/Header", () => ({
  PageHeader: ({ abrirSidebar }: { abrirSidebar: boolean }) => (
    <header data-testid="page-header">
      Header: {abrirSidebar ? "aberto" : "fechado"}
    </header>
  ),
}));

vi.mock("@/components/layout/Sidebar", () => ({
  Sidebar: ({ open, onToggle }: { open: boolean; onToggle: () => void }) => (
    <aside data-testid="sidebar">
      <span>Sidebar: {open ? "aberta" : "fechada"}</span>

      <button type="button" onClick={onToggle}>
        Alternar sidebar
      </button>
    </aside>
  ),
}));

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

describe("AppShell", () => {
  it("deve renderizar o conteúdo recebido em children", () => {
    render(
      <AppShell>
        <h1>Conteúdo da página</h1>
      </AppShell>,
    );

    expect(
      screen.getByRole("heading", {
        name: /conteúdo da página/i,
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar a sidebar, o header e o toaster", () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
  });

  it("deve iniciar com a sidebar fechada", () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    expect(screen.getByText("Sidebar: fechada")).toBeInTheDocument();
    expect(screen.getByText("Header: fechado")).toBeInTheDocument();
  });

  it("deve aplicar ml-20 quando a sidebar estiver fechada", () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    const main = screen.getByRole("main");

    expect(main).toHaveClass("ml-20");
    expect(main).not.toHaveClass("ml-65");
  });

  it("deve abrir a sidebar ao clicar no botão de alternância", () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /alternar sidebar/i,
      }),
    );

    expect(screen.getByText("Sidebar: aberta")).toBeInTheDocument();
    expect(screen.getByText("Header: aberto")).toBeInTheDocument();
  });

  it("deve aplicar ml-65 quando a sidebar estiver aberta", () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /alternar sidebar/i,
      }),
    );

    const main = screen.getByRole("main");

    expect(main).toHaveClass("ml-65");
    expect(main).not.toHaveClass("ml-20");
  });

  it("deve fechar a sidebar ao clicar novamente no botão", () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    const toggleButton = screen.getByRole("button", {
      name: /alternar sidebar/i,
    });

    fireEvent.click(toggleButton);

    expect(screen.getByText("Sidebar: aberta")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass("ml-65");

    fireEvent.click(toggleButton);

    expect(screen.getByText("Sidebar: fechada")).toBeInTheDocument();
    expect(screen.getByText("Header: fechado")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass("ml-20");
  });
});
