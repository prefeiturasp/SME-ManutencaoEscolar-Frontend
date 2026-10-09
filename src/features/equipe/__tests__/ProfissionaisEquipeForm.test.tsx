import type { Opcao } from "@/components/types/opcao.types";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfissionaisEquipe } from "../components/form/ProfissionaisEquipeForm";
import type { EquipeFormData, ProfissionalEquipeFormData } from "../schema/equipeSchema";

let selecao: UseFormReturn<ProfissionalEquipeFormData>;
let equipe: UseFormReturn<EquipeFormData>;
type FieldProps = { name: string; label: string; options: Opcao[]; onValueChange?: () => void };

vi.mock("@/components/form", async () => {
  const { useFormContext } = await import("react-hook-form");
  return {
    FormSelectField: ({ name, label, options }: FieldProps) => {
      const { register } = useFormContext();
      return (
        <select aria-label={label} {...register(name)}>
          <option value="">Selecione</option>
          {options.map((opcao) => (
            <option key={opcao.value} value={opcao.value}>
              {opcao.label}
            </option>
          ))}
        </select>
      );
    },
  };
});
vi.mock("@/components/form/FormComboboxField", async () => {
  const { useFormContext } = await import("react-hook-form");
  return {
    FormComboboxField: ({ label, options, onValueChange }: FieldProps) => {
      const methods = useFormContext<ProfissionalEquipeFormData>();
      useEffect(() => {
        selecao = methods;
      }, [methods]);
      const field = methods.register("profissional");
      return (
        <>
          <select
            aria-label={label}
            {...field}
            onChange={(event) => {
              void field.onChange(event);
              onValueChange?.();
            }}
          >
            <option value="">Selecione</option>
            {options.map((opcao) => (
              <option key={opcao.value} value={opcao.value}>
                {opcao.label}
              </option>
            ))}
          </select>
          <span role="alert">{methods.formState.errors.profissional?.message}</span>
        </>
      );
    },
  };
});

const opcoes = [
  { value: "p1", label: "111.111.111-11 - Ana" },
  { value: "p2", label: "222.222.222-22 - Bruno" },
  { value: "p3", label: "Carla" },
];
const profissionais = [
  { uuid: "p1", funcoes: [{ uuid: "f1", nome: "Eletricista" }] },
  { uuid: "p2", funcoes: [{ uuid: "f2", nome: "Pintor" }] },
  { uuid: "p3", funcoes: [] },
];
function Wrapper({ iniciais = [] }: { iniciais?: ProfissionalEquipeFormData[] }) {
  const methods = useForm<EquipeFormData>({ defaultValues: { profissionais: iniciais } });
  useEffect(() => {
    equipe = methods;
  }, [methods]);
  return (
    <FormProvider {...methods}>
      <ProfissionaisEquipe profissionaisOpcoes={opcoes} profissionais={profissionais} />
    </FormProvider>
  );
}
async function adicionar() {
  fireEvent.change(screen.getByLabelText("Profissional"), { target: { value: "p1" } });
  fireEvent.change(screen.getByLabelText("Função"), { target: { value: "f1" } });
  fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
  await screen.findByRole("table");
}

beforeEach(() => vi.clearAllMocks());
describe("ProfissionaisEquipe", () => {
  it("inicia sem tabela e impede adicionar uma seleção incompleta", async () => {
    render(<Wrapper />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(within(screen.getByLabelText("Função")).getAllByRole("option")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    await waitFor(() => expect(screen.getByRole("alert")).not.toBeEmptyDOMElement());
    expect(equipe.getValues("profissionais")).toEqual([]);
  });

  it("adiciona UUIDs, exibe nomes e CPF, limpa a seleção e permite remover", async () => {
    render(<Wrapper />);
    await adicionar();
    expect(equipe.getValues("profissionais")).toEqual([{ profissional: "p1", funcao: "f1" }]);
    const tabela = screen.getByRole("table");
    expect(within(tabela).getByText("Ana")).toBeInTheDocument();
    expect(within(tabela).getByText("111.111.111-11")).toBeInTheDocument();
    expect(within(tabela).getByText("Eletricista")).toBeInTheDocument();
    expect(screen.getByLabelText("Profissional")).toHaveValue("");
    expect(screen.getByLabelText("Função")).toHaveValue("");
    expect(
      within(screen.getByLabelText("Profissional")).queryByRole("option", {
        name: opcoes[0].label,
      }),
    ).not.toBeInTheDocument();
    const user = userEvent.setup();
    await user.hover(screen.getByRole("button", { name: "Remover Ana" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Excluir profissional");
    await user.click(screen.getByRole("button", { name: "Remover Ana" }));
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(equipe.getValues("profissionais")).toEqual([]);
    expect(
      within(screen.getByLabelText("Profissional")).getByRole("option", { name: opcoes[0].label }),
    ).toBeInTheDocument();
  });

  it("limpa a função ao trocar de profissional e oferece apenas suas funções", async () => {
    render(<Wrapper />);
    fireEvent.change(screen.getByLabelText("Profissional"), { target: { value: "p1" } });
    fireEvent.change(screen.getByLabelText("Função"), { target: { value: "f1" } });
    fireEvent.change(screen.getByLabelText("Profissional"), { target: { value: "p2" } });
    await waitFor(() => expect(selecao.getValues("funcao")).toBe(""));
    expect(screen.getByRole("option", { name: "Pintor" })).toHaveValue("f2");
    expect(screen.queryByRole("option", { name: "Eletricista" })).not.toBeInTheDocument();
  });

  it("rejeita um UUID já adicionado mesmo se recebido programaticamente", async () => {
    render(<Wrapper iniciais={[{ profissional: "p1", funcao: "f1" }]} />);
    act(() => {
      selecao.setValue("profissional", "p1");
      selecao.setValue("funcao", "f1");
    });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Este profissional já foi adicionado."),
    );
    expect(equipe.getValues("profissionais")).toHaveLength(1);
  });

  it("exibe valores alternativos para profissional indisponível, nome sem CPF e função desconhecida", () => {
    render(
      <Wrapper
        iniciais={[
          { profissional: "ausente", funcao: "ausente" },
          { profissional: "p3", funcao: "ausente" },
          { profissional: "p2", funcao: "ausente" },
        ]}
      />,
    );
    const linhas = within(screen.getByRole("table")).getAllByRole("row");
    expect(within(linhas[1]).getByText("Profissional indisponível")).toBeInTheDocument();
    expect(within(linhas[1]).getAllByText("—")).toHaveLength(2);
    expect(within(linhas[2]).getByText("Carla")).toBeInTheDocument();
    expect(within(linhas[2]).getAllByText("—")).toHaveLength(2);
    expect(within(linhas[3]).getByText("—")).toBeInTheDocument();
  });
});
