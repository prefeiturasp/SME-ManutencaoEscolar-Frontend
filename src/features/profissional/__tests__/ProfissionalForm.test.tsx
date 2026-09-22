import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfissionalForm } from "../components/form/ProfissionalForm";
import { ProfissionalApiError } from "../hooks/useCreateProfissional";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  mutate: vi.fn(),
  useListarCargos: vi.fn(),
  toastErro: vi.fn(),
  toastSucesso: vi.fn(),
  submitClick: undefined as undefined | (() => void),
}));

vi.mock("@/components/ui/button", async (importOriginal) => {
  const { Button: RealButton } = await importOriginal<typeof import("@/components/ui/button")>();
  return {
    Button: (props: React.ComponentProps<typeof RealButton>) => {
      if (props.children === "Cadastrar profissional") {
        mocks.submitClick = () => props.onClick?.({} as React.MouseEvent<HTMLButtonElement>);
      }
      return <RealButton {...props} />;
    },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}));
vi.mock("@/features/cargo/hooks/useListarCargo", () => ({
  useListarCargos: mocks.useListarCargos,
}));
vi.mock("../hooks/useCreateProfissional", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../hooks/useCreateProfissional")>()),
  useCreateProfissional: () => ({ mutate: mocks.mutate, isPending: false }),
}));
vi.mock("@/components/ui/toast-custom", () => ({
  toastErro: mocks.toastErro,
  toastSucesso: mocks.toastSucesso,
}));

vi.mock("@/components/form", async () => {
  const { useFormContext } = await import("react-hook-form");
  type FieldProps = {
    name: string;
    label: string;
    options?: { value: string; label: string }[];
    onValueChange?: (value: string) => void;
  };
  function TextField({ name, label }: FieldProps) {
    const { register } = useFormContext();
    return (
      <label>
        {label}
        <input aria-label={label} {...register(name)} />
      </label>
    );
  }
  function SelectField({ name, label, options }: FieldProps) {
    const { register } = useFormContext();
    return (
      <label>
        {label}
        <select aria-label={label} {...register(name)}>
          <option value="">Selecione</option>
          {options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    );
  }
  function FileField({ name, label }: FieldProps) {
    const { setValue } = useFormContext();
    return (
      <label>
        {label}
        <input
          aria-label={label}
          type="file"
          onChange={(event) =>
            setValue(name, Array.from(event.target.files ?? []), { shouldValidate: true })
          }
        />
      </label>
    );
  }
  return {
    FormTextField: TextField,
    FormMaskedField: TextField,
    FormSelectField: SelectField,
    FormFileField: FileField,
  };
});

vi.mock("@/components/form/FormComboboxField", async () => {
  const { useFormContext } = await import("react-hook-form");
  return {
    FormComboboxField: ({
      name,
      label,
      options,
      onValueChange,
    }: {
      name: string;
      label: string;
      options: { value: string; label: string }[];
      onValueChange: (value: string) => void;
    }) => {
      const { setValue, watch } = useFormContext();
      return (
        <label>
          {label}
          <select
            aria-label={label}
            value={watch(name) ?? ""}
            onChange={(event) => {
              setValue(name, event.target.value, { shouldValidate: true });
              onValueChange(event.target.value);
            }}
          >
            <option value="">Selecione</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      );
    },
  };
});

const cargos = [
  {
    uuid: "cargo-1",
    nome: "Engenheiro",
    exige_documento: true,
    documentos: [{ id: 1, nome: "Registro" }],
  },
  { uuid: "cargo-2", nome: "Auxiliar", exige_documento: false, documentos: [] },
];

function preencherDados() {
  fireEvent.change(screen.getByLabelText("Nome do profissional"), {
    target: { value: "João da Silva" },
  });
  fireEvent.change(screen.getByLabelText("Registro Geral (RG)"), {
    target: { value: "123456789" },
  });
  fireEvent.change(screen.getByLabelText("CPF ou CIN"), { target: { value: "12345678901" } });
  fireEvent.change(screen.getByLabelText("Status"), { target: { value: "true" } });
}

describe("ProfissionalForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.submitClick = undefined;
    mocks.useListarCargos.mockReturnValue({ data: { results: cargos } });
  });

  it("bloqueia cadastro incompleto, carrega todos os cargos e permite cancelar", () => {
    render(<ProfissionalForm />);
    expect(mocks.useListarCargos).toHaveBeenCalledWith({ page_size: "all" });
    expect(screen.getByRole("button", { name: "Cadastrar profissional" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(mocks.push).toHaveBeenCalledWith("/profissionais");
  });

  it("mostra o documento obrigatório e cadastra depois do anexo", async () => {
    render(<ProfissionalForm />);
    preencherDados();
    fireEvent.change(screen.getByLabelText("Função"), { target: { value: "cargo-1" } });
    expect(screen.getByLabelText("Registro")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cadastrar profissional" })).toBeDisabled();
    const arquivo = new File(["registro"], "registro.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Registro"), { target: { files: [arquivo] } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar profissional" }));
    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledOnce());
    const [payload, callbacks] = mocks.mutate.mock.calls[0];
    expect(payload).toMatchObject({
      nome: "João da Silva",
      cpf: "12345678901",
      status: true,
      funcoes: [{ uuid_cargo: "cargo-1", documentos: [{ arquivo: [arquivo] }] }],
    });
    callbacks.onSuccess({ success: true });
    expect(mocks.toastSucesso).toHaveBeenCalled();
    expect(mocks.replace).toHaveBeenCalledWith("/profissionais");
  });

  it("limpa os documentos ao trocar para uma função que não exige anexo", async () => {
    render(<ProfissionalForm />);
    preencherDados();
    fireEvent.change(screen.getByLabelText("Função"), { target: { value: "cargo-1" } });
    const arquivo = new File(["registro"], "registro.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Registro"), { target: { files: [arquivo] } });

    fireEvent.change(screen.getByLabelText("Função"), { target: { value: "cargo-2" } });
    expect(screen.queryByLabelText("Registro")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar profissional" }));

    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledOnce());
    expect(mocks.mutate.mock.calls[0][0].funcoes).toEqual([
      { uuid_cargo: "cargo-2", documentos: [] },
    ]);
  });

  it("adiciona e remove funções sem repetir cargos", () => {
    render(<ProfissionalForm />);
    fireEvent.change(screen.getByLabelText("Função"), { target: { value: "cargo-1" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar função" }));
    const selects = screen.getAllByLabelText("Função");
    expect(
      within(selects[1]).queryByRole("option", { name: "Engenheiro" }),
    ).not.toBeInTheDocument();
    fireEvent.change(selects[1], { target: { value: "cargo-2" } });
    expect(screen.getByRole("button", { name: "Adicionar função" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Remover função 1" }));
    expect(screen.getAllByLabelText("Função")).toHaveLength(1);
  });

  it("ignora cargos sem UUID nas opções de função", () => {
    mocks.useListarCargos.mockReturnValue({
      data: { results: [...cargos, { nome: "Sem identificador", documentos: [] }] },
    });
    render(<ProfissionalForm />);

    expect(screen.queryByRole("option", { name: "Sem identificador" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Função"), { target: { value: "cargo-1" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar função" }));
    expect(screen.getByRole("button", { name: "Adicionar função" })).toBeDisabled();
  });

  it("trata erro da API e falha inesperada no onError", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ProfissionalForm />);
    preencherDados();
    fireEvent.change(screen.getByLabelText("Função"), { target: { value: "cargo-2" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar profissional" }));
    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledOnce());
    const callbacks = mocks.mutate.mock.calls[0][1];
    const erroApi = new ProfissionalApiError("CPF duplicado");
    callbacks.onError(erroApi);
    expect(mocks.toastErro).toHaveBeenCalledWith({
      titulo: "Erro",
      descricao: "Não conseguimos cadastrar o profissional. Por favor, tente novamente.",
    });
    expect(consoleError).toHaveBeenCalledWith("Erro ao cadastrar profissional:", erroApi);
    callbacks.onError(
      new ProfissionalApiError("Documentos duplicados", {
        cpf: "CPF já cadastrado.",
        rg: "RG já cadastrado.",
      }),
    );
    expect(mocks.toastErro).toHaveBeenLastCalledWith({
      titulo: "Erro",
      descricao: "Não conseguimos cadastrar o profissional. Por favor, tente novamente.",
    });
    const erroInesperado = new Error("Falha inesperada");
    callbacks.onError(erroInesperado);
    expect(consoleError).toHaveBeenCalledWith("Erro ao cadastrar profissional:", erroInesperado);
    expect(mocks.toastErro).toHaveBeenCalledTimes(3);
    expect(mocks.replace).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("não envia dados inválidos e aguarda cargos quando a lista não chegou", () => {
    mocks.useListarCargos.mockReturnValue({ data: undefined });
    render(<ProfissionalForm />);
    expect(screen.getByRole("button", { name: "Adicionar função" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cadastrar profissional" })).toBeDisabled();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("bloqueia o envio quando o cargo selecionado desaparece da lista", async () => {
    const { rerender } = render(<ProfissionalForm />);
    preencherDados();
    fireEvent.change(screen.getByLabelText("Função"), { target: { value: "cargo-2" } });
    expect(screen.getByRole("button", { name: "Cadastrar profissional" })).toBeEnabled();

    mocks.useListarCargos.mockReturnValue({ data: { results: [cargos[0]] } });
    rerender(<ProfissionalForm />);
    expect(screen.getByRole("button", { name: "Cadastrar profissional" })).toBeDisabled();

    await act(async () => {
      mocks.submitClick?.();
    });
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("não envia quando a validação do RG falha apesar dos campos preenchidos", async () => {
    render(<ProfissionalForm />);
    preencherDados();
    fireEvent.change(screen.getByLabelText("Registro Geral (RG)"), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText("Função"), { target: { value: "cargo-2" } });

    fireEvent.click(screen.getByRole("button", { name: "Cadastrar profissional" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Cadastrar profissional" })).toBeEnabled(),
    );
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
});
