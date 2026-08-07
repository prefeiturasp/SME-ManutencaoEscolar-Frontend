import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("lucide-react", () => ({
  CircleCheck: () => <svg data-testid="icone-sucesso" />,
  CircleX: () => <svg data-testid="icone-erro" />,
}));

import { ResultadoRedefinirSenha } from "../components/ResultadoRedefinirSenha/ResultadoRedefinirSenha";

describe("ResultadoRedefinirSenha", () => {
  it("deve renderizar o resultado de sucesso", () => {
    render(<ResultadoRedefinirSenha tipo="sucesso" />);

    expect(
      screen.getByRole("heading", {
        name: "Recuperação de senha",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Você já pode acessar o Manutenção Escolar com sua nova senha.",
    );

    expect(screen.getByTestId("icone-sucesso")).toBeInTheDocument();

    expect(screen.queryByTestId("icone-erro")).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Acessar agora",
      }),
    ).toHaveAttribute("href", "/login");

    expect(
      screen.queryByRole("link", {
        name: "Solicitar novo link",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", {
        name: "Cancelar",
      }),
    ).not.toBeInTheDocument();
  });

  it("deve renderizar o resultado de token expirado", () => {
    render(<ResultadoRedefinirSenha tipo="token-expirado" />);

    expect(
      screen.getByRole("heading", {
        name: "O link está expirado!",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Por segurança, o link de redefinição expirou. Solicite um novo para redefinir sua senha.",
    );

    expect(screen.getByTestId("icone-erro")).toBeInTheDocument();

    expect(screen.queryByTestId("icone-sucesso")).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Solicitar novo link",
      }),
    ).toHaveAttribute("href", "/login/recuperar-senha");

    expect(
      screen.getByRole("link", {
        name: "Cancelar",
      }),
    ).toHaveAttribute("href", "/login");

    expect(
      screen.queryByRole("link", {
        name: "Acessar agora",
      }),
    ).not.toBeInTheDocument();
  });
});
