
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/layout/AppShell";

vi.mock("@/components/dashboard/PageHeader/PageHeader", () => ({
  PageHeader: ({ sidebarOpen }: { sidebarOpen: boolean }) => (
    <header data-testid="page-header">
      Header: {sidebarOpen ? "aberto" : "fechado"}
    </header>
  ),
}));

vi.mock("@/components/dashboard/Sidebar/Sidebar", () => ({
  Sidebar: ({
    open,
    onToggle,
  }: {
    open: boolean;
    onToggle: () => void;
  }) => (
    <aside data-testid="sidebar">
      <span>Sidebar: {open ? "aberta" : "fechada"}</span>

      <button type="button" onClick={onToggle}>
        Alternar sidebar
      </button>
    </aside>
  ),
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

  it("deve iniciar com a sidebar fechada", () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    expect(screen.getByText("Sidebar: fechada")).toBeInTheDocument();
    expect(screen.getByText("Header: fechado")).toBeInTheDocument();
  });

  it("deve aplicar margem de 80px quando a sidebar estiver fechada", () => {
    render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>,
    );

    const main = screen.getByRole("main");

    expect(main).toHaveClass("ml-[80px]");
    expect(main).not.toHaveClass("ml-[320px]");
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

  it("deve aplicar margem de 320px quando a sidebar estiver aberta", () => {
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

    expect(main).toHaveClass("ml-[320px]");
    expect(main).not.toHaveClass("ml-[80px]");
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

    fireEvent.click(toggleButton);

    expect(screen.getByText("Sidebar: fechada")).toBeInTheDocument();
    expect(screen.getByText("Header: fechado")).toBeInTheDocument();

    expect(screen.getByRole("main")).toHaveClass("ml-[80px]");
  });
});