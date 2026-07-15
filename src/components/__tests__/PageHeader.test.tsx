import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PageHeader } from "@/components/layout/Header";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

describe("PageHeader", () => {
  it("deve renderizar o logo quando a sidebar estiver fechada", () => {
    render(<PageHeader sidebarOpen={false} />);

    expect(screen.getByAltText("Manutenção Escolar")).toBeInTheDocument();
  });

  it("não deve renderizar o logo quando a sidebar estiver aberta", () => {
    render(<PageHeader sidebarOpen />);

    expect(screen.queryByAltText("Manutenção Escolar")).not.toBeInTheDocument();
  });

  it("deve renderizar os dados do usuário", () => {
    render(<PageHeader sidebarOpen={false} />);

    expect(screen.getByText("RF: 1234567")).toBeInTheDocument();
    expect(screen.getByText("Mário de Almeida Silva")).toBeInTheDocument();
    expect(screen.getByText("Fornecedor")).toBeInTheDocument();
  });

  it("deve renderizar os botões de notificações e sair", () => {
    render(<PageHeader sidebarOpen={false} />);

    expect(
      screen.getByRole("button", {
        name: /abrir notificações/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /sair/i,
      }),
    ).toBeInTheDocument();
  });

  it("deve exibir a quantidade de notificações", () => {
    render(<PageHeader sidebarOpen={false} />);

    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("Notificações")).toBeInTheDocument();
  });

  it("deve aplicar left-[250px] quando a sidebar estiver aberta", () => {
    render(<PageHeader sidebarOpen />);

    const header = screen.getByRole("banner");

    expect(header).toHaveClass("left-[250px]");
    expect(header).not.toHaveClass("left-[80px]");
  });

  it("deve aplicar left-[80px] quando a sidebar estiver fechada", () => {
    render(<PageHeader sidebarOpen={false} />);

    const header = screen.getByRole("banner");

    expect(header).toHaveClass("left-[80px]");
    expect(header).not.toHaveClass("left-[250px]");
  });
});
