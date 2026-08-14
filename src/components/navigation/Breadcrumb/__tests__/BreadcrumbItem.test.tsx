import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BreadcrumbItem } from "../BreadcrumbItem";

describe("BreadcrumbItem", () => {
  it("deve renderizar o rótulo do item", () => {
    render(
      <BreadcrumbItem
        item={{
          rotulo: "Cadastro",
          paginaAtual: true,
        }}
      />,
    );

    expect(screen.getByText("Cadastro")).toBeInTheDocument();
  });

  it("deve renderizar um link quando o item possuir caminho e não for a página atual", () => {
    render(
      <BreadcrumbItem
        item={{
          rotulo: "Início",
          caminho: "/",
        }}
      />,
    );

    const link = screen.getByRole("link", {
      name: "Início",
    });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveClass("flex", "items-center", "gap-2");
  });

  it("não deve renderizar link quando o item for a página atual", () => {
    render(
      <BreadcrumbItem
        item={{
          rotulo: "Serviços",
          caminho: "/cadastro/servicos",
          paginaAtual: true,
        }}
      />,
    );

    expect(
      screen.queryByRole("link", {
        name: "Serviços",
      }),
    ).not.toBeInTheDocument();

    expect(screen.getByText("Serviços").parentElement).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("não deve renderizar link quando o item não possuir caminho", () => {
    render(
      <BreadcrumbItem
        item={{
          rotulo: "Cadastro",
        }}
      />,
    );

    expect(
      screen.queryByRole("link", {
        name: "Cadastro",
      }),
    ).not.toBeInTheDocument();

    expect(screen.getByText("Cadastro").parentElement).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("deve renderizar o ícone recebido", () => {
    render(
      <BreadcrumbItem
        item={{
          rotulo: "Início",
          caminho: "/",
          icone: <svg data-testid="breadcrumb-icon" />,
        }}
      />,
    );

    expect(screen.getByTestId("breadcrumb-icon")).toBeInTheDocument();
  });

  it("deve renderizar o ícone e o rótulo dentro do link", () => {
    render(
      <BreadcrumbItem
        item={{
          rotulo: "Início",
          caminho: "/",
          icone: <svg data-testid="breadcrumb-icon" />,
        }}
      />,
    );

    const link = screen.getByRole("link", {
      name: "Início",
    });

    expect(link).toContainElement(screen.getByTestId("breadcrumb-icon"));
    expect(link).toContainElement(screen.getByText("Início"));
  });
});
