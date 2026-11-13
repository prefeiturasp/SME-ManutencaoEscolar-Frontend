import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  push: vi.fn(),
  isPending: false,
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

vi.mock("@/features/login/hooks/useRecuperarSenha", () => ({
  useRecuperarSenha: () => ({
    mutateAsync: mocks.mutateAsync,
    isPending: mocks.isPending,
  }),
}));

vi.mock("@/components/form/FormTextField", async () => {
  const { useFormContext } =
    await vi.importActual<typeof import("react-hook-form")>("react-hook-form");

  return {
    FormTextField: ({
      name,
      placeholder,
    }: {
      name: string;
      placeholder?: string;
    }) => {
      const { register } = useFormContext();

      return <input {...register(name)} placeholder={placeholder} />;
    },
  };
});

vi.mock(
  "@/features/login/components/ResultadoRecuperacaoSenha/ResultadoRecuperacaoSenha",
  () => ({
    ResultadoRecuperacaoSenha: ({
      resultado,
      onContinuar,
    }: {
      resultado:
        | {
            success: true;
            email: string;
          }
        | {
            success: false;
            title: string;
            detail: string;
          };
      onContinuar: () => void;
    }) => (
      <div data-testid="resultado-recuperacao">
        <span>{resultado.success ? resultado.email : resultado.title}</span>

        <button type="button" onClick={onContinuar}>
          Continuar resultado
        </button>
      </div>
    ),
  }),
);

import { RecuperarSenhaForm } from "../components/RecuperarSenhaForm/RecuperarSenhaForm";

describe("RecuperarSenhaForm", () => {
  beforeEach(() => {
    mocks.mutateAsync.mockReset();
    mocks.push.mockReset();
    mocks.isPending = false;
  });

  it("deve renderizar o formulário inicialmente", () => {
    render(<RecuperarSenhaForm />);

    expect(screen.getByText("Recuperação de senha")).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Digite o RF ou CPF"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Confirmar",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("link", {
        name: "Voltar",
      }),
    ).toHaveAttribute("href", "/login");
  });

  it("deve enviar o login e mostrar o resultado de sucesso", async () => {
    const user = userEvent.setup();

    mocks.mutateAsync.mockResolvedValue({
      success: true,
      email: "mat********@email.com",
    });

    render(<RecuperarSenhaForm />);

    await user.type(
      screen.getByPlaceholderText("Digite o RF ou CPF"),
      "48801758545",
    );

    const botaoConfirmar = screen.getByRole("button", {
      name: "Confirmar",
    });

    await waitFor(() => {
      expect(botaoConfirmar).toBeEnabled();
    });

    await user.click(botaoConfirmar);

    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      login: "48801758545",
    });

    expect(
      await screen.findByText("mat********@email.com"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Continuar resultado",
      }),
    );

    expect(mocks.push).toHaveBeenCalledWith("/login");
  });

  it("deve mostrar o erro e redirecionar para o login", async () => {
    const user = userEvent.setup();

    mocks.mutateAsync.mockResolvedValue({
      success: false,
      title: "Usuário não encontrado.",
      detail: "Verifique se o RF ou CPF digitados estão corretos.",
    });

    render(<RecuperarSenhaForm />);

    await user.type(
      screen.getByPlaceholderText("Digite o RF ou CPF"),
      "48801758545",
    );

    const botaoConfirmar = screen.getByRole("button", {
      name: "Confirmar",
    });

    await waitFor(() => {
      expect(botaoConfirmar).toBeEnabled();
    });

    await user.click(botaoConfirmar);

    expect(
      await screen.findByText("Usuário não encontrado."),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Continuar resultado",
      }),
    );

    expect(mocks.push).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith("/login");

    expect(
      screen.queryByPlaceholderText("Digite o RF ou CPF"),
    ).not.toBeInTheDocument();
  });

  it("deve exibir o loading enquanto envia", async () => {
    const user = userEvent.setup();

    mocks.isPending = true;

    render(<RecuperarSenhaForm />);

    await user.type(
      screen.getByPlaceholderText("Digite o RF ou CPF"),
      "48801758545",
    );

    const botao = screen.getByRole("button", {
      name: "Enviando...",
    });

    await waitFor(() => {
      expect(botao).toBeDisabled();
    });

    expect(screen.getByText("Enviando...")).toHaveClass("sr-only");

    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });
});
