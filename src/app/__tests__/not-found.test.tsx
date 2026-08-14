import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import NotFound from "../not-found";

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string | { src: string };
    alt: string;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : src.src}
      alt={alt}
      className={className}
    />
  ),
}));

describe("NotFound", () => {
  it("deve renderizar o estado vazio com o link para a página inicial", () => {
    render(<NotFound />);

    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Não encontramos esta página" }),
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "Voltar para o início" });
    expect(link).toHaveAttribute("href", "/");
  });
});
