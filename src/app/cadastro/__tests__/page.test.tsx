import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CadastroPage from "../page";

const { breadcrumbMock, pathnameMock } = vi.hoisted(() => ({
  breadcrumbMock: vi.fn(),
  pathnameMock: vi.fn(() => "/cadastro"),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

vi.mock("@/components/navigation/Breadcrumb/Breadcrumb", () => ({
  Breadcrumb: (props: {
    itens: Array<{
      rotulo: string;
      caminho?: string;
      paginaAtual?: boolean;
    }>;
  }) => {
    breadcrumbMock(props);

    return <nav aria-label="breadcrumb" />;
  },
}));

describe("CadastroPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o título da página", () => {
    render(<CadastroPage />);

    expect(
      screen.getByRole("heading", {
        name: "Cadastro",
      }),
    ).toBeInTheDocument();
  });

  it("deve enviar os itens corretos ao breadcrumb", () => {
    render(<CadastroPage />);

    const props = breadcrumbMock.mock.calls[0][0];

    expect(props.itens).toHaveLength(2);
    expect(props.itens[0]).toEqual(
      expect.objectContaining({
        rotulo: "Início",
        caminho: "/",
      }),
    );

    expect(props.itens[1]).toEqual(
      expect.objectContaining({
        rotulo: "Cadastro",
        paginaAtual: true,
      }),
    );
  });
});
