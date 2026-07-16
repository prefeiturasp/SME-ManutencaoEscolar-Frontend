import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import Home from "../dashboard/page";

describe("Home", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve renderizar os textos principais da página", () => {
    render(<Home />);

    expect(screen.getByText("Status da API")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /health check/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("O endpoint retornou:")).toBeInTheDocument();
  });

  it("deve renderizar o botão para cadastrar fornecedor", () => {
    render(<Home />);

    expect(
      screen.getByRole("button", {
        name: /cadastrar fornecedor/i,
      }),
    ).toBeInTheDocument();
  });

  it("deve abrir o modal ao clicar em cadastrar fornecedor", async () => {
    const user = userEvent.setup();

    render(<Home />);

    await user.click(
      screen.getByRole("button", {
        name: /cadastrar fornecedor/i,
      }),
    );

    expect(
      screen.getByRole("alertdialog", {
        name: /excluir fornecedor/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "A ação não poderá ser desfeita. Tem certeza que deseja continuar?",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /excluir contato/i,
      }),
    ).toBeInTheDocument();
  });

  it("deve excluir o fornecedor ao confirmar", async () => {
    const user = userEvent.setup();
    const consoleSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    render(<Home />);

    await user.click(
      screen.getByRole("button", {
        name: /cadastrar fornecedor/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /excluir contato/i,
      }),
    );

    expect(consoleSpy).toHaveBeenCalledWith("Fornecedor excluído");
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });
});
