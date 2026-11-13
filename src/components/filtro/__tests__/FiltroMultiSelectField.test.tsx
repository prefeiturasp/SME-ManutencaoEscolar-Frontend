import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FiltroMultiSelectField } from "../FiltroMultiSelectField";

describe("FiltroMultiSelectField", () => {
  it("desmarca uma opção pelo checkbox e preserva as outras seleções", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const props = {
      id: "categorias",
      label: "Categorias",
      options: [
        { value: "a", label: "Categoria A" },
        { value: "b", label: "Categoria B" },
      ],
      value: ["a", "b"],
      onChange,
    };
    const { rerender } = render(<FiltroMultiSelectField {...props} />);
    await user.click(screen.getByRole("button", { name: "Categorias" }));
    await user.click(screen.getByRole("checkbox", { name: "Categoria A" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(["b"]);
    rerender(<FiltroMultiSelectField {...props} value={["b"]} />);
    expect(screen.getByRole("checkbox", { name: "Categoria A" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Categoria B" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Selecionar todas" })).toBePartiallyChecked();
    expect(screen.queryByRole("button", { name: "Remover Categoria A" })).not.toBeInTheDocument();
  });
  it("aceita rótulos próprios e bloqueia abertura e remoção quando desabilitado", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const props = {
      id: "categorias",
      label: "Categorias",
      options: [{ value: "a", label: "Categoria A" }],
      value: ["a"],
      onChange,
      placeholder: "Escolha as categorias",
    };
    const { rerender } = render(<FiltroMultiSelectField {...props} disabled />);
    expect(screen.getByRole("button", { name: "Categorias" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remover Categoria A" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Categorias" }));
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    rerender(<FiltroMultiSelectField {...props} />);
    await user.click(screen.getByRole("button", { name: "Remover Categoria A" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith([]);
    rerender(<FiltroMultiSelectField {...props} value={[]} />);
    expect(screen.getByRole("button", { name: "Categorias" })).toHaveTextContent(
      "Escolha as categorias",
    );
  });

  it("não permite selecionar todas quando não há opções", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FiltroMultiSelectField
        id="categorias"
        label="Categorias"
        value={[]}
        options={[]}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Categorias" }));
    expect(screen.getByRole("checkbox", { name: "Selecionar todas" })).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
