import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock(
  "@/features/login/components/CriteriosSenha.tsx/CriteriosSenha",
  () => ({
    CriteriosSenha: ({ senha }: { senha: string }) => (
      <div data-testid="criterios-senha">{senha}</div>
    ),
  }),
);

vi.mock(
  "@/features/login/components/ResultadoRedefinirSenha/ResultadoRedefinirSenha",
  () => ({
    ResultadoRedefinirSenha: ({
      tipo,
    }: {
      tipo: "sucesso" | "token-expirado";
    }) => (
      <div data-testid="resultado-redefinicao" data-tipo={tipo}>
        Resultado da redefinição
      </div>
    ),
  }),
);

import { RedefinirSenhaForm } from "../components/RedefinirSenhaForm/RedefinirSenhaForm";

describe("RedefinirSenhaForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("deve renderizar o formulário inicialmente", () => {
    render(<RedefinirSenhaForm id="48801758545" token="token-recuperacao" />);

    expect(
      screen.getByRole("heading", {
        name: "Crie uma nova senha",
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Nova senha")).toHaveAttribute(
      "type",
      "password",
    );

    expect(screen.getByLabelText("Confirmação da nova senha")).toHaveAttribute(
      "type",
      "password",
    );

    expect(
      screen.getByRole("button", {
        name: "Salvar senha",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("link", {
        name: "Cancelar",
      }),
    ).toHaveAttribute("href", "/login");
  });

  it("deve mostrar e ocultar as senhas", async () => {
    const user = userEvent.setup();

    render(<RedefinirSenhaForm id="48801758545" token="token-recuperacao" />);

    const novaSenha = screen.getByLabelText("Nova senha");

    const confirmacao = screen.getByLabelText("Confirmação da nova senha");

    await user.click(
      screen.getByRole("button", {
        name: "Mostrar nova senha",
      }),
    );

    expect(novaSenha).toHaveAttribute("type", "text");

    await user.click(
      screen.getByRole("button", {
        name: "Ocultar nova senha",
      }),
    );

    expect(novaSenha).toHaveAttribute("type", "password");

    await user.click(
      screen.getByRole("button", {
        name: "Mostrar confirmação da senha",
      }),
    );

    expect(confirmacao).toHaveAttribute("type", "text");

    await user.click(
      screen.getByRole("button", {
        name: "Ocultar confirmação da senha",
      }),
    );

    expect(confirmacao).toHaveAttribute("type", "password");
  });

  it("deve mostrar erro quando as senhas não coincidirem", async () => {
    const user = userEvent.setup();

    render(<RedefinirSenhaForm id="48801758545" token="token-recuperacao" />);

    const novaSenha = screen.getByLabelText("Nova senha");

    const confirmacao = screen.getByLabelText("Confirmação da nova senha");

    await user.type(novaSenha, "Abcdef1@");
    await user.type(confirmacao, "Abcdef1#");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "As senhas não coincidem",
    );

    expect(
      screen.getByRole("button", {
        name: "Salvar senha",
      }),
    ).toBeDisabled();

    await user.clear(confirmacao);
    await user.type(confirmacao, "Abcdef1@");

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: "Salvar senha",
        }),
      ).toBeEnabled();
    });
  });

  it("deve salvar, mostrar loading e exibir sucesso", async () => {
    const user = userEvent.setup();

    render(<RedefinirSenhaForm id="48801758545" token="token-recuperacao" />);

    await user.type(screen.getByLabelText("Nova senha"), "Abcdef1@");

    await user.type(
      screen.getByLabelText("Confirmação da nova senha"),
      "Abcdef1@",
    );

    const botaoSalvar = screen.getByRole("button", {
      name: "Salvar senha",
    });

    await waitFor(() => {
      expect(botaoSalvar).toBeEnabled();
    });

    await user.click(botaoSalvar);

    expect(await screen.findByText("Salvando senha...")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Salvando senha...",
      }),
    ).toBeDisabled();

    expect(console.log).toHaveBeenCalledWith({
      token: "token-recuperacao",
      novaSenha: "Abcdef1@",
      id: "48801758545",
    });

    expect(
      await screen.findByTestId(
        "resultado-redefinicao",
        {},
        {
          timeout: 2000,
        },
      ),
    ).toHaveAttribute("data-tipo", "sucesso");
  });
});
