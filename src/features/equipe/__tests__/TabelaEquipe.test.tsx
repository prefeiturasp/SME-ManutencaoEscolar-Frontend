import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { TabelaEquipe } from "../components/list/TabelaEquipe";
import type { Equipe } from "../types/equipe.types";

it("usa ID quando não há UUID, diferencia linhas ativas e inativas e informa atualização", () => {
  const equipes = [
    { id: 1, uuid: "", nome: "Equipe ativa", situacao: true },
    { id: 2, uuid: "", nome: "Equipe inativa", situacao: false },
  ] as Equipe[];
  const colunas = [{ id: "nome", titulo: "Nome", renderizar: (equipe: Equipe) => equipe.nome }];
  const { container, rerender } = render(
    <TabelaEquipe equipes={equipes} colunas={colunas} atualizando />,
  );
  expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  expect(screen.getByText("Equipe ativa").closest("tr")).not.toHaveClass("bg-background");
  expect(screen.getByText("Equipe inativa").closest("tr")).toHaveClass(
    "bg-background",
    "text-blocked-foreground",
  );
  rerender(<TabelaEquipe equipes={equipes} colunas={colunas} />);
  expect(container.querySelector('[aria-busy="false"]')).toBeInTheDocument();
});

it("renderiza equipes identificadas somente por uuid sem avisos de chave", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  const equipes = [
    { uuid: "equipe-1", nome: "Equipe Norte" },
    { uuid: "equipe-2", nome: "Equipe Sul" },
  ] as Equipe[];

  try {
    render(
      <TabelaEquipe
        equipes={equipes}
        colunas={[{ id: "nome", titulo: "Nome", renderizar: (equipe) => equipe.nome }]}
      />,
    );
    expect(screen.getByText("Equipe Norte")).toBeInTheDocument();
    expect(screen.getByText("Equipe Sul")).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();
  } finally {
    consoleError.mockRestore();
  }
});
