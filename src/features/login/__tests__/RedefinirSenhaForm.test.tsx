import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  alterarSenha: vi.fn(),
  isPending: false,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/features/login/hooks/useRedefinirSenha", () => ({
  useAlterarSenha: () => ({
    mutateAsync: mocks.alterarSenha,
    isPending: mocks.isPending,
  }),
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
      title,
      detail,
    }: {
      tipo: "sucesso" | "token-expirado";
      title?: string;
      detail?: string;
    }) => (
      <div
        data-testid="resultado-redefinicao"
        data-tipo={tipo}
        data-title={title}
        data-detail={detail}
      >
        Resultado da redefinição
      </div>
    ),
  }),
);

import { RedefinirSenhaForm } from "../components/RedefinirSenhaForm/RedefinirSenhaForm";

const props = {
  id: "48801758545",
  token: "token-recuperacao",
};

const senhaValida = "Abcdef1@";

async function preencherSenhas(
  novaSenha = senhaValida,
  confirmacao = senhaValida,
) {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Nova senha"), novaSenha);

  await user.type(
    screen.getByLabelText("Confirmação da nova senha"),
    confirmacao,
  );

  return user;
}

describe("RedefinirSenhaForm", () => {
  beforeEach(() => {
    mocks.alterarSenha.mockReset();
    mocks.isPending = false;
  });

  it("deve renderizar o formulário inicialmente", () => {
    render(<RedefinirSenhaForm {...props} />);

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

    render(<RedefinirSenhaForm {...props} />);

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

    render(<RedefinirSenhaForm {...props} />);

    await user.type(screen.getByLabelText("Nova senha"), senhaValida);

    const confirmacao = screen.getByLabelText("Confirmação da nova senha");

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
    await user.type(confirmacao, senhaValida);

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", {
        name: "Salvar senha",
      }),
    ).toBeEnabled();
  });

  it("deve enviar os dados e exibir sucesso", async () => {
    mocks.alterarSenha.mockResolvedValueOnce({
      success: true,
    });

    render(<RedefinirSenhaForm {...props} />);

    const user = await preencherSenhas();

    const salvar = screen.getByRole("button", {
      name: "Salvar senha",
    });

    await waitFor(() => {
      expect(salvar).toBeEnabled();
    });

    await user.click(salvar);

    await waitFor(() => {
      expect(mocks.alterarSenha).toHaveBeenCalledWith({
        registro_funcional_ou_cpf: "48801758545",
        token: "token-recuperacao",
        senha: senhaValida,
        confirmacao_senha: senhaValida,
      });
    });

    expect(await screen.findByTestId("resultado-redefinicao")).toHaveAttribute(
      "data-tipo",
      "sucesso",
    );
  });

  it("deve exibir o resultado de token expirado", async () => {
    mocks.alterarSenha.mockResolvedValueOnce({
      success: false,
      title: "O link está expirado!",
      detail: "Solicite um novo link.",
    });

    render(<RedefinirSenhaForm {...props} />);

    const user = await preencherSenhas();

    const salvar = screen.getByRole("button", {
      name: "Salvar senha",
    });

    await waitFor(() => {
      expect(salvar).toBeEnabled();
    });

    await user.click(salvar);

    const resultado = await screen.findByTestId("resultado-redefinicao");

    expect(resultado).toHaveAttribute("data-tipo", "token-expirado");

    expect(resultado).toHaveAttribute("data-title", "O link está expirado!");

    expect(resultado).toHaveAttribute("data-detail", "Solicite um novo link.");
  });

  it("deve mostrar o erro genérico retornado pela API", async () => {
    mocks.alterarSenha.mockResolvedValueOnce({
      success: false,
      title: "Erro ao redefinir senha",
      detail: "Não foi possível alterar a senha.",
    });

    render(<RedefinirSenhaForm {...props} />);

    const user = await preencherSenhas();

    const salvar = screen.getByRole("button", {
      name: "Salvar senha",
    });

    await waitFor(() => {
      expect(salvar).toBeEnabled();
    });

    await user.click(salvar);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível alterar a senha.",
    );

    await user.type(screen.getByLabelText("Nova senha"), "x");

    await waitFor(() => {
      expect(
        screen.queryByText("Não foi possível alterar a senha."),
      ).not.toBeInTheDocument();
    });
  });

  it("deve mostrar loading enquanto a requisição estiver pendente", async () => {
    mocks.isPending = true;

    render(<RedefinirSenhaForm {...props} />);

    await preencherSenhas();

    const salvar = screen.getByRole("button", {
      name: "Salvando senha...",
    });

    await waitFor(() => {
      expect(salvar).toBeDisabled();
    });

    expect(screen.getByText("Salvando senha...")).toHaveClass("sr-only");

    expect(salvar).toHaveClass(
      "disabled:bg-[var(--primary-dark)]",
      "disabled:text-primary-foreground",
      "disabled:opacity-100",
    );

    expect(mocks.alterarSenha).not.toHaveBeenCalled();
  });
});
