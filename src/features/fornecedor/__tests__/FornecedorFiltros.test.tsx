import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FornecedorFiltros } from "../components/list/FornecedorFiltros";

describe("FornecedorFiltros", () => {
  it("deve renderizar os campos nome, razão social, cnpj e status", () => {
    render(
      <FornecedorFiltros
        values={{ nome: "", razao_social: "", cnpj: "", status: "" }}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/^nome$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/razão social/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^cnpj$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /status/i }),
    ).toBeInTheDocument();
  });

  it("deve chamar onChange com o nome do campo alterado", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <FornecedorFiltros
        values={{ nome: "", razao_social: "", cnpj: "", status: "" }}
        onChange={onChange}
        onSearch={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText(/razão social/i), "a");

    expect(onChange).toHaveBeenCalledWith("razao_social", "a");
  });

  it("deve chamar onSearch ao clicar em buscar fornecedor", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(
      <FornecedorFiltros
        values={{ nome: "empresa", razao_social: "", cnpj: "", status: "" }}
        onChange={vi.fn()}
        onSearch={onSearch}
        onClear={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /buscar empresas/i }));

    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});
