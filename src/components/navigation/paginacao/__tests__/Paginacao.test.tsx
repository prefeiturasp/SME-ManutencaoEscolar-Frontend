import type { ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Paginacao } from "../Paginacao";

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (valor: string) => void;
    children: ReactNode;
  }) => (
    <div data-testid="registros-por-pagina" data-value={value}>
      {children}

      <button
        type="button"
        onClick={() => {
          onValueChange("20");
        }}
      >
        Alterar para 20 registros
      </button>
    </div>
  ),

  SelectTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),

  SelectValue: () => <span>Quantidade selecionada</span>,

  SelectContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),

  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => (
    <div data-value={value}>{children}</div>
  ),
}));

describe("Paginacao", () => {
  it("não deve renderizar quando não houver registros", () => {
    const { container } = render(
      <Paginacao
        paginaAtual={1}
        totalRegistros={0}
        registrosPorPagina={10}
        onMudarPagina={vi.fn()}
        onMudarRegistrosPorPagina={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("deve renderizar a primeira página e permitir avançar", () => {
    const onMudarPagina = vi.fn();
    const onMudarRegistrosPorPagina = vi.fn();

    render(
      <Paginacao
        paginaAtual={1}
        totalRegistros={25}
        registrosPorPagina={10}
        onMudarPagina={onMudarPagina}
        onMudarRegistrosPorPagina={onMudarRegistrosPorPagina}
      />,
    );

    expect(
      screen.getByText("Mostrando 1-10 de 25 registro(s)"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Página anterior",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Próxima página",
      }),
    ).toBeEnabled();

    expect(
      screen.getByRole("button", {
        name: "Ir para a página 1",
      }),
    ).toHaveAttribute("aria-current", "page");

    expect(
      screen.getByRole("button", {
        name: "Ir para a página 2",
      }),
    ).not.toHaveAttribute("aria-current");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ir para a página 2",
      }),
    );

    expect(onMudarPagina).toHaveBeenCalledWith(2);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Próxima página",
      }),
    );

    expect(onMudarPagina).toHaveBeenLastCalledWith(2);

    expect(screen.getByTestId("registros-por-pagina")).toHaveAttribute(
      "data-value",
      "10",
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Alterar para 20 registros",
      }),
    );

    expect(onMudarRegistrosPorPagina).toHaveBeenCalledWith(20);
  });

  it("deve calcular corretamente a última página incompleta", () => {
    const onMudarPagina = vi.fn();

    render(
      <Paginacao
        paginaAtual={3}
        totalRegistros={25}
        registrosPorPagina={10}
        onMudarPagina={onMudarPagina}
        onMudarRegistrosPorPagina={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Mostrando 21-25 de 25 registro(s)"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Próxima página",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Página anterior",
      }),
    ).toBeEnabled();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Página anterior",
      }),
    );

    expect(onMudarPagina).toHaveBeenCalledWith(2);
  });

  it("deve exibir no máximo nove páginas visíveis", () => {
    const onMudarPagina = vi.fn();

    render(
      <Paginacao
        paginaAtual={10}
        totalRegistros={200}
        registrosPorPagina={10}
        onMudarPagina={onMudarPagina}
        onMudarRegistrosPorPagina={vi.fn()}
      />,
    );

    const botoesPaginas = screen.getAllByRole("button", {
      name: /ir para a página/i,
    });

    expect(botoesPaginas).toHaveLength(9);

    expect(
      screen.queryByRole("button", {
        name: "Ir para a página 1",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Ir para a página 2",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Ir para a página 10",
      }),
    ).toHaveAttribute("aria-current", "page");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ir para a página 2",
      }),
    );

    expect(onMudarPagina).toHaveBeenCalledWith(2);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Próxima página",
      }),
    );

    expect(onMudarPagina).toHaveBeenLastCalledWith(11);
  });
});
