import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfissionalFiltros } from "../components/list/ProfissionalFiltros";

const useListarCargos = vi.fn();

vi.mock("@/features/cargo/hooks/useListarCargo", () => ({
  useListarCargos: (filtros: unknown) => useListarCargos(filtros),
}));

describe("ProfissionalFiltros", () => {
  beforeEach(() => {
    useListarCargos.mockReturnValue({
      data: {
        results: [
          { uuid: "cargo-1", nome: "Engenheiro", documentos: [] },
          { uuid: "cargo-2", nome: "Auxiliar", documentos: [] },
          { nome: "Sem identificador", documentos: [] },
        ],
      },
    });
  });

  it("carrega todos os cargos e os exibe como opções de função", async () => {
    const user = userEvent.setup();

    render(
      <ProfissionalFiltros
        values={{ nome: "", rg: "", cpf: "", funcao: "", status: "" }}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(useListarCargos).toHaveBeenCalledWith({ page_size: "all" });

    await user.click(screen.getByRole("button", { name: /funções/i }));

    expect(screen.getByText("Engenheiro")).toBeInTheDocument();
    expect(screen.getByText("Auxiliar")).toBeInTheDocument();
    expect(screen.queryByText("Sem identificador")).not.toBeInTheDocument();
  });

  it("atualiza o filtro de função com a chave esperada pela listagem", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ProfissionalFiltros
        values={{ nome: "", rg: "", cpf: "", funcao: "", status: "" }}
        onChange={onChange}
        onSearch={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /funções/i }));
    await user.click(screen.getByText("Engenheiro"));

    expect(onChange).toHaveBeenCalledWith("funcao", "cargo-1");
  });

  it("aceita a resposta de cargos ainda indisponível", () => {
    useListarCargos.mockReturnValue({ data: undefined });

    render(
      <ProfissionalFiltros
        values={{ nome: "", rg: "", cpf: "", funcao: "", status: "" }}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /funções/i })).toBeInTheDocument();
  });
});
