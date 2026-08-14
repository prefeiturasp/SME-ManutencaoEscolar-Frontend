import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BreadcrumbSeparator } from "../BreadcrumbSeparator";

vi.mock("lucide-react", () => ({
  ChevronRight: ({
    className,
    strokeWidth,
  }: {
    className?: string;
    strokeWidth?: number;
  }) => (
    <svg
      data-testid="chevron-right"
      className={className}
      data-stroke-width={strokeWidth}
    />
  ),
}));

describe("BreadcrumbSeparator", () => {
  it("deve renderizar o separador", () => {
    const { container } = render(<BreadcrumbSeparator />);

    const separador = container.querySelector("span");

    expect(separador).toBeInTheDocument();
  });

  it("deve esconder o separador de leitores de tela", () => {
    const { container } = render(<BreadcrumbSeparator />);

    const separador = container.querySelector("span");

    expect(separador).toHaveAttribute("aria-hidden", "true");
  });

  it("deve aplicar as classes do separador", () => {
    const { container } = render(<BreadcrumbSeparator />);

    const separador = container.querySelector("span");

    expect(separador).toHaveClass(
      "flex",
      "size-4",
      "shrink-0",
      "items-center",
      "justify-center",
      "rounded-full",
      "bg-primary",
      "text-white",
    );
  });

  it("deve renderizar o ícone ChevronRight", () => {
    render(<BreadcrumbSeparator />);

    expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
  });

  it("deve aplicar tamanho e espessura corretos ao ícone", () => {
    render(<BreadcrumbSeparator />);

    const icone = screen.getByTestId("chevron-right");

    expect(icone).toHaveClass("size-3");
    expect(icone).toHaveAttribute("data-stroke-width", "4");
  });
});
