import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ListFilters } from "@/components/shared/ListFilters";
import type {
  ListFilterField,
  ListFilterValues,
} from "@/components/shared/types/ListFilters.type";

const FIELDS: readonly ListFilterField[] = [
  { name: "nome", label: "Nome", type: "text", placeholder: "Digite o nome" },
  {
    name: "cnpj",
    label: "CNPJ",
    type: "masked",
    placeholder: "00.000.000/0000-00",
    mask: (value) => value.replace(/(\d{2})(\d)/, "$1.$2"),
    unmask: (value) => value.replaceAll(".", ""),
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "true", label: "Ativo" },
      { value: "false", label: "Inativo" },
    ],
  },
];

function renderListFilters(overrides?: {
  values?: ListFilterValues;
  onChange?: (name: string, value: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
}) {
  const onChange = overrides?.onChange ?? vi.fn();
  const onSearch = overrides?.onSearch ?? vi.fn();
  const onClear = overrides?.onClear ?? vi.fn();
  const values = overrides?.values ?? { nome: "", cnpj: "", status: "" };

  render(
    <ListFilters
      fields={FIELDS}
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
    />,
  );

  return { onChange, onSearch, onClear };
}

describe("ListFilters", () => {
  it("deve renderizar o título e a descrição padrão", () => {
    renderListFilters();

    expect(screen.getByText(/refine sua busca/i)).toBeInTheDocument();
    expect(
      screen.getByText(/utilize o filtro para localizar os registros/i),
    ).toBeInTheDocument();
  });

  it("deve renderizar título, descrição e rótulo de busca customizados", () => {
    render(
      <ListFilters
        title="Título customizado"
        description="Descrição customizada"
        searchLabel="Buscar fornecedor"
        fields={FIELDS}
        values={{ nome: "", cnpj: "", status: "" }}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByText(/título customizado/i)).toBeInTheDocument();
    expect(screen.getByText(/descrição customizada/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /buscar fornecedor/i }),
    ).toBeInTheDocument();
  });

  it("deve renderizar um campo de texto por configuração", () => {
    renderListFilters();

    expect(screen.getByLabelText(/^nome$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite o nome")).toBeInTheDocument();
  });

  it("deve chamar onChange ao digitar em um campo de texto", async () => {
    const user = userEvent.setup();
    const { onChange } = renderListFilters();

    await user.type(screen.getByLabelText(/^nome$/i), "a");

    expect(onChange).toHaveBeenCalledWith("nome", "a");
  });

  it("deve aplicar a máscara no campo mascarado a partir do valor informado", () => {
    renderListFilters({ values: { nome: "", cnpj: "12345678", status: "" } });

    expect(screen.getByLabelText(/^cnpj$/i)).toHaveValue("12.345678");
  });

  it("deve chamar onChange com o valor desmascarado ao digitar no campo mascarado", async () => {
    const user = userEvent.setup();
    const { onChange } = renderListFilters();

    await user.type(screen.getByLabelText(/^cnpj$/i), "1");

    expect(onChange).toHaveBeenCalledWith("cnpj", "1");
  });

  it("deve renderizar as opções do campo select", async () => {
    const user = userEvent.setup();
    renderListFilters();

    const statusTrigger = screen.getByRole("combobox", { name: /status/i });
    await user.click(statusTrigger);

    expect(
      await screen.findByRole("option", { name: /^ativo$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /^inativo$/i }),
    ).toBeInTheDocument();
  });

  it("deve chamar onChange ao selecionar uma opção", async () => {
    const user = userEvent.setup();
    const { onChange } = renderListFilters();

    await user.click(screen.getByRole("combobox", { name: /status/i }));
    await user.click(await screen.findByRole("option", { name: /^ativo$/i }));

    expect(onChange).toHaveBeenCalledWith("status", "true");
  });

  it("deve chamar onSearch ao clicar em buscar quando houver filtro preenchido", async () => {
    const user = userEvent.setup();
    const { onSearch } = renderListFilters({
      values: { nome: "a", cnpj: "", status: "" },
    });

    await user.click(screen.getByRole("button", { name: /buscar/i }));

    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onClear ao clicar em limpar filtros", async () => {
    const user = userEvent.setup();
    const { onClear } = renderListFilters({
      values: { nome: "a", cnpj: "", status: "" },
    });

    await user.click(screen.getByRole("button", { name: /limpar filtros/i }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("deve manter o botão de buscar desabilitado quando nenhum filtro estiver preenchido", () => {
    renderListFilters();

    expect(screen.getByRole("button", { name: /buscar/i })).toBeDisabled();
  });

  it("deve manter o botão de buscar desabilitado quando os filtros contiverem apenas espaços", () => {
    renderListFilters({ values: { nome: "   ", cnpj: "", status: "" } });

    expect(screen.getByRole("button", { name: /buscar/i })).toBeDisabled();
  });

  it("deve habilitar o botão de buscar quando ao menos um filtro estiver preenchido", () => {
    renderListFilters({ values: { nome: "a", cnpj: "", status: "" } });

    expect(screen.getByRole("button", { name: /buscar/i })).toBeEnabled();
  });
});
