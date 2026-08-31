import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Sidebar } from "@/components/layout/Sidebar";

vi.mock("next/image", () => ({
  default: ({
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {}) => {
    return <img alt={alt ?? ""} {...props} />;
  },
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Sidebar", () => {
  it("deve renderizar a sidebar fechada", () => {
    const onToggle = vi.fn();

    const { container } = render(<Sidebar open={false} onToggle={onToggle} />);

    const sidebar = container.querySelector("aside");

    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass("w-[80px]");

    expect(
      screen.getByRole("button", { name: /abrir menu/i }),
    ).toBeInTheDocument();

    expect(screen.queryByAltText("Manutenção Escolar")).not.toBeInTheDocument();
  });

  it("deve renderizar a sidebar aberta", () => {
    const onToggle = vi.fn();

    const { container } = render(<Sidebar open onToggle={onToggle} />);

    const sidebar = container.querySelector("aside");

    expect(sidebar).toHaveClass("w-[260PX]");

    expect(
      screen.getByRole("button", { name: /^fechar menu$/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /fechar menu ao clicar fora/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByAltText("Manutenção Escolar")).toBeInTheDocument();
  });

  it("deve chamar onToggle ao clicar no botão principal da sidebar", () => {
    const onToggle = vi.fn();

    render(<Sidebar open={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: /abrir menu/i }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("deve abrir o submenu de cadastro quando a sidebar estiver aberta", () => {
    const onToggle = vi.fn();

    render(<Sidebar open onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: /cadastro/i }));

    expect(screen.getByRole("link", { name: "Empresas" })).toHaveAttribute(
      "href",
      "/empresas",
    );

    expect(screen.getByRole("link", { name: "Serviços" })).toHaveAttribute(
      "href",
      "/servicos",
    );
    expect(screen.getByRole("link", { name: "Lotes" })).toHaveAttribute(
      "href",
      "/lotes",
    );

    expect(
      screen.getByRole("link", { name: "Unidades Educacionais" }),
    ).toHaveAttribute("href", "/unidades-educacionais");
  });

  it("deve fechar o submenu ao clicar novamente em cadastro", () => {
    const onToggle = vi.fn();

    render(<Sidebar open onToggle={onToggle} />);

    const cadastroButton = screen.getByRole("button", {
      name: /cadastro/i,
    });

    fireEvent.click(cadastroButton);

    expect(screen.getByRole("link", { name: "Empresas" })).toBeInTheDocument();
  });

  it("deve abrir a sidebar e preparar o submenu quando cadastro for clicado com a sidebar fechada", () => {
    const onToggle = vi.fn();

    const { rerender } = render(<Sidebar open={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: /cadastro/i }));

    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(<Sidebar open onToggle={onToggle} />);
  });

  it("não deve exibir os links de cadastro inicialmente", () => {
    const onToggle = vi.fn();

    render(<Sidebar open onToggle={onToggle} />);

    expect(
      screen.queryByRole("link", { name: "Empresas" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Serviços" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "Lotes" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Unidades Educacionais" }),
    ).not.toBeInTheDocument();
  });

  it("deve aplicar o estilo ativo ao botão quando o submenu estiver aberto", () => {
    const onToggle = vi.fn();

    render(<Sidebar open onToggle={onToggle} />);

    const cadastroButton = screen.getByRole("button", {
      name: /cadastro/i,
    });

    fireEvent.click(cadastroButton);

    expect(cadastroButton).toHaveClass("bg-white");
    expect(cadastroButton).toHaveClass("text-secondary");
  });

  it("deve fechar o submenu Cadastro ao clicar no botão de fechar", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<Sidebar open onToggle={onToggle} />);

    await user.click(screen.getByRole("button", { name: /cadastro/i }));

    await user.click(screen.getByRole("button", { name: /^fechar menu$/i }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("deve fechar a sidebar ao clicar fora dela", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<Sidebar open onToggle={onToggle} />);

    await user.click(screen.getByRole("button", { name: /cadastro/i }));

    await user.click(
      screen.getByRole("button", {
        name: /fechar menu ao clicar fora/i,
      }),
    );

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("deve fechar a sidebar ao clicar em um link do submenu", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<Sidebar open onToggle={onToggle} />);

    await user.click(
      screen.getByRole("button", {
        name: /cadastro/i,
      }),
    );

    const servicosLink = screen.getByRole("link", {
      name: "Serviços",
    });

    expect(servicosLink).toBeInTheDocument();

    await user.click(servicosLink);

    expect(onToggle).toHaveBeenCalledTimes(1);

    expect(
      screen.queryByRole("link", {
        name: "Serviços",
      }),
    ).not.toBeInTheDocument();
  });
});
