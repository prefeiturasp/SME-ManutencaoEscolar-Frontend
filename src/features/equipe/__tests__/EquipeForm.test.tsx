import type { Opcao } from "@/components/types/opcao.types";
import { STATUS_OPCOES } from "@/constants/constants";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormEquipe } from "../components/form/EquipeForm";

vi.mock("@/components/form", () => ({
  FormTextField: (props: { name: string; label: string; placeholder: string }) => (
    <input aria-label={props.label} name={props.name} placeholder={props.placeholder} />
  ),
  FormSelectField: (props: { name: string; label: string; options: Opcao[] }) => (
    <select aria-label={props.label} name={props.name}>
      {props.options.map((opcao) => (
        <option key={opcao.value} value={opcao.value}>
          {opcao.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock("@/components/form/FormComboboxField", () => ({
  FormComboboxField: (props: {
    name: string;
    label: string;
    options: Opcao[];
    placeholder: string;
    helperText?: string;
    tooltip?: string;
  }) => (
    <label title={props.tooltip}>
      {props.label}
      <select aria-label={props.label} name={props.name}>
        <option value="">{props.placeholder}</option>
        {props.options.map((opcao) => (
          <option key={opcao.value} value={opcao.value}>
            {opcao.label}
          </option>
        ))}
      </select>
      <span>{props.helperText}</span>
    </label>
  ),
}));

describe("FormEquipe", () => {
  it("renderiza os campos e repassa as opções de situação, empresa e lote", () => {
    render(
      <FormEquipe
        empresasOpcoes={[{ value: "empresa-1", label: "Empresa teste" }]}
        lotesOpcoes={[{ value: "lote-1", label: "Lote teste" }]}
      />,
    );
    expect(screen.getByLabelText("Nome da equipe")).toHaveAttribute(
      "placeholder",
      "Digite o nome da equipe",
    );
    expect(screen.getByLabelText("Nome da equipe")).toHaveAttribute("name", "nome");
    expect(screen.getByLabelText("Situação")).toHaveAttribute("name", "situacao");
    for (const opcao of STATUS_OPCOES)
      expect(screen.getByRole("option", { name: opcao.label })).toHaveValue(opcao.value);
    expect(screen.getByRole("option", { name: "Empresa teste" })).toHaveValue("empresa-1");
    expect(screen.getByRole("option", { name: "Lote teste" })).toHaveValue("lote-1");
    expect(screen.getByText("Busque pelo CNPJ, nome social ou código.")).toBeInTheDocument();
  });

  it("renderiza os placeholders quando não existem empresas ou lotes", () => {
    render(<FormEquipe empresasOpcoes={[]} lotesOpcoes={[]} />);
    expect(screen.getByLabelText("Empresa")).toHaveValue("");
    expect(screen.getByLabelText("Lote")).toHaveValue("");
    expect(screen.getByRole("option", { name: "Selecione a empresa" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Selecione o lote" })).toBeInTheDocument();
  });
});
