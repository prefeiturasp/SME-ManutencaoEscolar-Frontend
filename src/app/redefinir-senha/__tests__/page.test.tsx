import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock(
  "@/features/login/components/RedefinirSenhaForm/RedefinirSenhaForm",
  () => ({
    RedefinirSenhaForm: ({ id, token }: { id: string; token: string }) => (
      <div data-testid="redefinir-senha-form" data-id={id} data-token={token} />
    ),
  }),
);

import Page from "../page";

describe("RedefinirSenhaPage", () => {
  it("deve enviar id e token para o formulário", async () => {
    const componente = await Page({
      searchParams: Promise.resolve({
        id: "48801758545",
        token: "token-recuperacao",
      }),
    });

    render(componente);

    const formulario = screen.getByTestId("redefinir-senha-form");

    expect(formulario).toHaveAttribute("data-id", "48801758545");
    expect(formulario).toHaveAttribute("data-token", "token-recuperacao");
  });

  it("deve enviar strings vazias quando os parâmetros não existirem", async () => {
    const componente = await Page({
      searchParams: Promise.resolve({}),
    });

    render(componente);

    const formulario = screen.getByTestId("redefinir-senha-form");

    expect(formulario).toHaveAttribute("data-id", "");
    expect(formulario).toHaveAttribute("data-token", "");
  });
});
