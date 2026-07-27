import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Home from "../page";

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

describe("Home", () => {
  it("deve renderizar o conteúdo da página", () => {
    render(<Home />);

    expect(screen.getByTestId("app-shell")).toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 2 })).toBeEmptyDOMElement();
  });
});
