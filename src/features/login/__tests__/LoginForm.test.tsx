import type { ReactNode } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mutateAsyncMock, useLoginMock } = vi.hoisted(() => ({
  mutateAsyncMock: vi.fn(),
  useLoginMock: vi.fn(),
}));

vi.mock("@/features/login/hooks/useLogin", () => ({
  useLogin: useLoginMock,
}));

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

vi.mock("@/components/icons/tooltip", () => ({
  HelpIcon: ({ className }: { className?: string }) => (
    <svg data-testid="help-icon" className={className} aria-hidden="true" />
  ),
}));

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: ReactNode }) => (
    <div role="tooltip">{children}</div>
  ),
}));

import { LoginForm } from "../components/LoginForm/LoginForm";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useLoginMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    });
  });

  it("deve renderizar os campos, tooltip e link de recuperação", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("RF ou CPF")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Digite o RF ou CPF"),
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Digite sua senha")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Informações sobre o campo",
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("help-icon")).toBeInTheDocument();

    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Caso faça parte de uma Diretoria Regional de Ensino (DRE), insira o RF. Para empresas, informe o CPF.",
    );

    expect(
      screen.getByRole("link", {
        name: "Esqueci minha senha",
      }),
    ).toHaveAttribute("href", "/login/recuperar-senha");
  });

  it("deve iniciar com o botão desabilitado", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("button", {
        name: "Acessar",
      }),
    ).toBeDisabled();

    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("deve enviar login e senha quando o formulário for válido", async () => {
    const user = userEvent.setup();

    mutateAsyncMock.mockResolvedValue({
      success: true,
      user: {},
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("RF ou CPF"), "1234567");

    await user.type(screen.getByLabelText("Senha"), "senha123");

    const botao = screen.getByRole("button", {
      name: "Acessar",
    });

    await waitFor(() => {
      expect(botao).toBeEnabled();
    });

    await user.click(botao);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledOnce();
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      login: "1234567",
      senha: "senha123",
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("deve exibir a mensagem retornada quando o login falhar", async () => {
    const user = userEvent.setup();

    mutateAsyncMock.mockResolvedValue({
      success: false,
      error: "Credenciais inválidas.",
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("RF ou CPF"), "1234567");

    await user.type(screen.getByLabelText("Senha"), "senha123");

    const botao = screen.getByRole("button", {
      name: "Acessar",
    });

    await waitFor(() => {
      expect(botao).toBeEnabled();
    });

    await user.click(botao);

    const alerta = await screen.findByRole("alert");

    expect(alerta).toHaveTextContent("Credenciais inválidas.");
    expect(alerta).toHaveAttribute("aria-live", "polite");
  });

  it("deve limpar a mensagem anterior antes de um novo login", async () => {
    const user = userEvent.setup();

    mutateAsyncMock
      .mockResolvedValueOnce({
        success: false,
        error: "Credenciais inválidas.",
      })
      .mockResolvedValueOnce({
        success: true,
        user: {},
      });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("RF ou CPF"), "1234567");

    await user.type(screen.getByLabelText("Senha"), "senha123");

    const botao = screen.getByRole("button", {
      name: "Acessar",
    });

    await waitFor(() => {
      expect(botao).toBeEnabled();
    });

    await user.click(botao);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Credenciais inválidas.",
    );

    await user.click(botao);

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    expect(mutateAsyncMock).toHaveBeenCalledTimes(2);
  });

  it("deve enviar o formulário pelo evento submit", async () => {
    mutateAsyncMock.mockResolvedValue({
      success: true,
      user: {},
    });

    const { container } = render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("RF ou CPF"), {
      target: {
        value: "1234567",
      },
    });

    fireEvent.change(screen.getByLabelText("Senha"), {
      target: {
        value: "senha123",
      },
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Acessar",
        }),
      ).toBeEnabled();
    });

    const form = container.querySelector("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        login: "1234567",
        senha: "senha123",
      });
    });
  });

  it("deve mostrar o estado de carregamento", () => {
    useLoginMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: true,
    });

    const { container } = render(<LoginForm />);

    const botao = screen.getByRole("button", {
      name: "Entrando...",
    });

    expect(botao).toBeDisabled();

    expect(botao).toHaveClass(
      "bg-[var(--primary-dark)]",
      "disabled:bg-[var(--primary-dark)]",
      "disabled:text-primary-foreground",
      "disabled:text-primary-foreground",
      "disabled:opacity-100",
    );

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Acessar",
      }),
    ).not.toBeInTheDocument();
  });
});
