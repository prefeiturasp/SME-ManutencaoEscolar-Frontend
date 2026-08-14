import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Breadcrumb } from "../Breadcrumb";

vi.mock("../BreadcrumbItem", () => ({
  BreadcrumbItem: ({
    item,
  }: {
    item: {
      rotulo: string;
    };
  }) => <span>{item.rotulo}</span>,
}));

vi.mock("../BreadcrumbSeparator", () => ({
  BreadcrumbSeparator: () => <span data-testid="breadcrumb-separator">/</span>,
}));

describe("Breadcrumb", () => {
  it("não deve renderizar nada quando a lista de itens estiver vazia", () => {
    const { container } = render(<Breadcrumb itens={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("deve renderizar a navegação com o aria-label correto", () => {
    render(
      <Breadcrumb
        itens={[
          {
            rotulo: "Início",
            caminho: "/",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("navigation", {
        name: "Breadcrumb",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar todos os itens recebidos", () => {
    render(
      <Breadcrumb
        itens={[
          {
            rotulo: "Início",
            caminho: "/",
          },
          {
            rotulo: "Cadastro",
            caminho: "/cadastro",
          },
          {
            rotulo: "Serviços",
            paginaAtual: true,
          },
        ]}
      />,
    );

    expect(screen.getByText("Início")).toBeInTheDocument();
    expect(screen.getByText("Cadastro")).toBeInTheDocument();
    expect(screen.getByText("Serviços")).toBeInTheDocument();
  });

  it("deve renderizar separadores apenas entre os itens", () => {
    render(
      <Breadcrumb
        itens={[
          {
            rotulo: "Início",
            caminho: "/",
          },
          {
            rotulo: "Cadastro",
            caminho: "/cadastro",
          },
          {
            rotulo: "Serviços",
            paginaAtual: true,
          },
        ]}
      />,
    );

    expect(screen.getAllByTestId("breadcrumb-separator")).toHaveLength(2);
  });

  it("não deve renderizar separador quando existir apenas um item", () => {
    render(
      <Breadcrumb
        itens={[
          {
            rotulo: "Início",
            paginaAtual: true,
          },
        ]}
      />,
    );

    expect(
      screen.queryByTestId("breadcrumb-separator"),
    ).not.toBeInTheDocument();
  });

  it("deve aplicar a className recebida junto com as classes padrão", () => {
    render(
      <Breadcrumb
        className="mb-8"
        itens={[
          {
            rotulo: "Início",
            paginaAtual: true,
          },
        ]}
      />,
    );

    const breadcrumb = screen.getByRole("navigation", {
      name: "Breadcrumb",
    });

    expect(breadcrumb).toHaveClass("flex", "items-center", "mb-8");
  });

  it("não deve renderizar link para itens sem caminho", () => {
    render(
      <Breadcrumb
        itens={[
          {
            rotulo: "Início",
            paginaAtual: true,
          },
        ]}
      />,
    );

    expect(screen.getByText("Início")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("deve renderizar os itens dentro de uma lista ordenada", () => {
    render(
      <Breadcrumb
        itens={[
          {
            rotulo: "Início",
            caminho: "/",
          },
          {
            rotulo: "Cadastro",
            paginaAtual: true,
          },
        ]}
      />,
    );

    const lista = screen.getByRole("list");

    expect(lista.tagName).toBe("OL");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
