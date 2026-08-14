import { render, screen } from "@testing-library/react";
import type { ReactNode, SVGProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { ResultadoRedefinirSenha } from "../components/ResultadoRedefinirSenha/ResultadoRedefinirSenha";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("lucide-react", () => ({
  CircleCheck: (props: SVGProps<SVGSVGElement>) => (
    <svg data-testid="icone-sucesso" {...props} />
  ),
  CircleX: (props: SVGProps<SVGSVGElement>) => (
    <svg data-testid="icone-erro" {...props} />
  ),
}));

describe("ResultadoRedefinirSenha", () => {
  it("apresenta o resultado de sucesso", () => {
    render(<ResultadoRedefinirSenha tipo="sucesso" />);

    expect(screen.getByText("Recuperação de senha")).toBeInTheDocument();

    const alerta = screen.getByRole("alert");

    expect(alerta).toHaveTextContent(
      "Você já pode acessar o Manutenção Escolar com sua nova senha.",
    );

    expect(alerta).toHaveClass(
      "bg-[var(--aproved-background)]/10",
      "text-green-800",
    );

    expect(screen.getByTestId("icone-sucesso")).toBeInTheDocument();

    expect(screen.queryByTestId("icone-erro")).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Acessar agora" })).toHaveAttribute(
      "href",
      "/login",
    );

    expect(
      screen.queryByRole("link", { name: "Solicitar novo link" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "Cancelar" }),
    ).not.toBeInTheDocument();
  });

  it("apresenta o token expirado com título e detalhe recebidos", () => {
    render(
      <ResultadoRedefinirSenha
        tipo="token-expirado"
        title="O link está expirado!"
        detail="Solicite outro link para redefinir sua senha."
      />,
    );

    expect(screen.getByText("O link está expirado!")).toBeInTheDocument();

    const alerta = screen.getByRole("alert");

    expect(alerta).toHaveTextContent(
      "Solicite outro link para redefinir sua senha.",
    );

    expect(alerta).toHaveClass("bg-red-50", "text-red-800");

    expect(screen.getByTestId("icone-erro")).toBeInTheDocument();

    expect(screen.queryByTestId("icone-sucesso")).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Solicitar novo link",
      }),
    ).toHaveAttribute("href", "/login/recuperar-senha");

    expect(screen.getByRole("link", { name: "Cancelar" })).toHaveAttribute(
      "href",
      "/login",
    );

    expect(
      screen.queryByRole("link", { name: "Acessar agora" }),
    ).not.toBeInTheDocument();
  });

  it("utiliza os textos padrões quando título e detalhe não são informados", () => {
    render(<ResultadoRedefinirSenha tipo="token-expirado" />);

    expect(
      screen.getByText("Não foi possível redefinir a senha."),
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível redefinir a senha. Solicite um novo link.",
    );

    expect(
      screen.getByRole("link", {
        name: "Solicitar novo link",
      }),
    ).toHaveAttribute("href", "/login/recuperar-senha");

    expect(screen.getByRole("link", { name: "Cancelar" })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
