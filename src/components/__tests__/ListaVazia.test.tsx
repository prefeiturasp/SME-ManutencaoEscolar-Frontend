import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ListaVazio } from "../shared/ListaVazia/ListaVazia";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
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
    <img
      src={typeof src === "string" ? src : src.src}
      alt={alt}
      className={className}
    />
  ),
}));

describe("ListaVazio", () => {
  it("deve renderizar o estado vazio com os valores informados", () => {
    const { container } = render(
      <ListaVazio
        titulo="Não há serviços cadastrados"
        descricao="Que tal cadastrar o primeiro serviço agora?"
        textoBotao="Cadastrar serviço"
        href="/cadastro/servicos/cadastrar"
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Não há serviços cadastrados",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Que tal cadastrar o primeiro serviço agora?"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cadastrar serviço",
      }),
    ).toHaveAttribute("href", "/cadastro/servicos/cadastrar");

    const imagem = container.querySelector("img");

    expect(imagem).toBeInTheDocument();
    expect(imagem).toHaveAttribute("alt", "");
    expect(imagem).toHaveClass("mb-4", "h-auto", "w-48");
  });

  it("não deve renderizar descrição quando ela não for informada", () => {
    render(
      <ListaVazio
        titulo="Lista vazia"
        descricao=""
        textoBotao="Cadastrar"
        href="/cadastrar"
      />,
    );

    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cadastrar",
      }),
    ).toBeInTheDocument();
  });

  it("não deve renderizar descrição quando ela estiver vazia", () => {
    const { container } = render(
      <ListaVazio
        titulo="Lista vazia"
        descricao=""
        textoBotao="Cadastrar"
        href="/cadastrar"
      />,
    );

    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("não deve renderizar o botão quando o texto não for informado", () => {
    render(
      <ListaVazio
        titulo="Lista vazia"
        descricao="Nenhum registro encontrado"
        textoBotao=""
        href="/cadastrar"
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("não deve renderizar o botão quando o href não for informado", () => {
    render(
      <ListaVazio
        titulo="Lista vazia"
        descricao="Nenhum registro encontrado"
        textoBotao="Cadastrar"
        href=""
      />,
    );

    expect(
      screen.queryByRole("link", {
        name: "Cadastrar",
      }),
    ).not.toBeInTheDocument();
  });

  it("deve renderizar o botão com a variante primária", () => {
    render(
      <ListaVazio
        titulo="Lista vazia"
        descricao="Nenhum registro encontrado"
        textoBotao="Cadastrar"
        href="/cadastrar"
        primary
      />,
    );

    expect(
      screen.getByRole("link", {
        name: "Cadastrar",
      }),
    ).toBeInTheDocument();
  });
});
