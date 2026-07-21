import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DashboardLayout from "../layout";

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

describe("DashboardLayout", () => {
  it("deve renderizar os children dentro do AppShell", () => {
    render(
      <DashboardLayout>
        <p>Conteúdo do dashboard</p>
      </DashboardLayout>,
    );

    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do dashboard")).toBeInTheDocument();
  });
});
