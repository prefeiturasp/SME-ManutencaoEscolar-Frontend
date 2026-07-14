import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PageHeader } from "@/components/dashboard/PageHeader/PageHeader";

// Mock do next/image]
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

describe("PageHeader", () => {
  it("deve renderizar o logo", () => {
    render(<PageHeader sidebarOpen />);

    expect(screen.getByAltText("Manutenção Escolar")).toBeInTheDocument();
  });

  it("deve renderizar os dados do usuário", () => {
    render(<PageHeader sidebarOpen />);

    expect(screen.getByText("RF: 1234567")).toBeInTheDocument();
    expect(screen.getByText("Mário de Almeida Silva")).toBeInTheDocument();
    expect(screen.getByText("Fornecedor")).toBeInTheDocument();
  });

  it("deve renderizar os botões de notificações e sair", () => {
    render(<PageHeader sidebarOpen />);

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
    render(<PageHeader sidebarOpen />);

    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("Notificações")).toBeInTheDocument();
  });

  it("deve aplicar a classe left-[250px] quando sidebar estiver aberta", () => {
    const { container } = render(<PageHeader sidebarOpen />);

    const header = container.querySelector("header");

    expect(header).toHaveClass("left-[250px]");
    expect(header).not.toHaveClass("left-[80px]");
  });

  it("deve aplicar a classe left-[80px] quando sidebar estiver fechada", () => {
    const { container } = render(<PageHeader sidebarOpen={false} />);

    const header = container.querySelector("header");

    expect(header).toHaveClass("left-[80px]");
    expect(header).not.toHaveClass("left-[135px]");
  });
});
