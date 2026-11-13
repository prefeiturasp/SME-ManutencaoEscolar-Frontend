import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { criarColunasCargo } from "@/features/cargo/components/colunasCargo";
import type { Cargo } from "@/features/cargo/types/cargos.types";

const cargo = {
  uuid: "uuid-cargo-1",
  nome: "Engenheiro",
  exige_documento: true,
} as Cargo;

describe("criarColunasCargo", () => {
  it("cria as colunas de nome, exigência de documento e ações", () => {
    const colunas = criarColunasCargo({ onEditar: vi.fn() });

    expect(colunas.map((coluna) => coluna.id)).toEqual([
      "nome",
      "exige_documento",
      "acoes",
    ]);
  });

  it("mostra o nome do cargo", () => {
    const colunas = criarColunasCargo({ onEditar: vi.fn() });
    const colunaNome = colunas.find((coluna) => coluna.id === "nome");

    expect(colunaNome?.renderizar(cargo)).toBe("Engenheiro");
  });

  it("mostra Sim quando o cargo exige documento", () => {
    const colunas = criarColunasCargo({ onEditar: vi.fn() });
    const colunaDocumento = colunas.find(
      (coluna) => coluna.id === "exige_documento",
    );

    expect(colunaDocumento?.renderizar(cargo)).toBe("Sim");
  });

  it("mostra Não quando o cargo não exige documento", () => {
    const colunas = criarColunasCargo({ onEditar: vi.fn() });
    const colunaDocumento = colunas.find(
      (coluna) => coluna.id === "exige_documento",
    );

    expect(
      colunaDocumento?.renderizar({
        ...cargo,
        exige_documento: false,
      }),
    ).toBe("Não");
  });

  it("chama onEditar com o cargo ao clicar no botão", () => {
    const onEditar = vi.fn();
    const colunas = criarColunasCargo({ onEditar });
    const colunaAcoes = colunas.find((coluna) => coluna.id === "acoes");

    expect(colunaAcoes).toBeDefined();

    render(<>{colunaAcoes?.renderizar(cargo)}</>);

    fireEvent.click(screen.getByRole("button", { name: "Editar Engenheiro" }));

    expect(onEditar).toHaveBeenCalledExactlyOnceWith(cargo);
  });
});
