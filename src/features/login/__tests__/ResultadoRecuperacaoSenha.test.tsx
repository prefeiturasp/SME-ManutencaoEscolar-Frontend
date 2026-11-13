import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ResultadoRecuperacaoSenha } from "../components/ResultadoRecuperacaoSenha/ResultadoRecuperacaoSenha";

describe("ResultadoRecuperacaoSenha", () => {
  it("deve renderizar o resultado de sucesso e continuar", async () => {
    const user = userEvent.setup();
    const onContinuar = vi.fn();

    const { container } = render(
      <ResultadoRecuperacaoSenha
        resultado={{
          success: true,
          email: "mat********@email.com",
        }}
        onContinuar={onContinuar}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Recuperação de senha",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("status")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Seu link de recuperação de senha foi enviado para mat********@email.com.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Verifique sua caixa de entrada ou lixo eletrônico."),
    ).toBeInTheDocument();

    expect(container.querySelector(".lucide-circle-check")).toBeInTheDocument();

    expect(container.querySelector(".lucide-circle-x")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Continuar",
      }),
    );

    expect(onContinuar).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar o resultado de erro", () => {
    const onContinuar = vi.fn();

    const { container } = render(
      <ResultadoRecuperacaoSenha
        resultado={{
          success: false,
          title: "Usuário não encontrado.",
          detail:
            "Verifique se o RF ou CPF digitados estão corretos e tente novamente.",
        }}
        onContinuar={onContinuar}
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();

    expect(screen.getByText("Usuário não encontrado.")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Verifique se o RF ou CPF digitados estão corretos e tente novamente.",
      ),
    ).toBeInTheDocument();

    expect(container.querySelector(".lucide-circle-x")).toBeInTheDocument();

    expect(
      container.querySelector(".lucide-circle-check"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Continuar",
      }),
    ).toBeInTheDocument();

    expect(onContinuar).not.toHaveBeenCalled();
  });
});
