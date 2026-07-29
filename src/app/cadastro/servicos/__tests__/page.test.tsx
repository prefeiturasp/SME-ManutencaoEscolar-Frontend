import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ServicosPage from "../page";

const { breadcrumbMock, pathnameMock } = vi.hoisted(() => ({
  breadcrumbMock: vi.fn(),
  pathnameMock: vi.fn(() => "/cadastro/servicos"),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/navigation/Breadcrumb/Breadcrumb", () => ({
  Breadcrumb: (props: {
    itens: Array<{
      rotulo: string;
      caminho?: string;
      paginaAtual?: boolean;
    }>;
    className?: string;
  }) => {
    breadcrumbMock(props);

    return <nav aria-label="breadcrumb" />;
  },
}));

describe("ServicosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o título e o link para cadastrar serviços", () => {
    render(<ServicosPage />);

    expect(
      screen.getByRole("heading", {
        name: "Serviços",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /cadastrar serviços/i,
      }),
    ).toHaveAttribute("href", "/cadastro/servicos/cadastrar");
  });

  it("deve enviar os itens e a classe corretos ao breadcrumb", () => {
    render(<ServicosPage />);

    const props = breadcrumbMock.mock.calls[0][0];

    expect(props.className).toBe("mb-8 mt-1 text-xs");
    expect(props.itens.map((item: { rotulo: string }) => item.rotulo)).toEqual([
      "Início",
      "Cadastro",
      "Serviços",
    ]);

    expect(props.itens[0]).toEqual(
      expect.objectContaining({
        rotulo: "Início",
        caminho: "/",
      }),
    );

    expect(props.itens[1]).toEqual(
      expect.objectContaining({
        rotulo: "Cadastro",
        caminho: "/cadastro",
      }),
    );

    expect(props.itens[2]).toEqual(
      expect.objectContaining({
        rotulo: "Serviços",
        paginaAtual: true,
      }),
    );
  });
});
