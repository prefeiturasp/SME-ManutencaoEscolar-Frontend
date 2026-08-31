import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { STATUS_OPCOES } from "@/constants/constants";

import { FormLote } from "@/features/lotes/components/FormLote";

const {
  formTextFieldMock,
  formSelectFieldMock,
  formMultiSelectFieldMock,
  formComboboxFieldMock,
  formDateRangeFieldMock,
} = vi.hoisted(() => ({
  formTextFieldMock: vi.fn(),
  formSelectFieldMock: vi.fn(),
  formMultiSelectFieldMock: vi.fn(),
  formComboboxFieldMock: vi.fn(),
  formDateRangeFieldMock: vi.fn(),
}));

type CampoMockProps = {
  name?: string;
  nameInicial?: string;
  nameFinal?: string;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  helperText?: string;
  options?: ReadonlyArray<{
    label: string;
    value: string;
  }>;
};

vi.mock("@/components/form", () => ({
  FormTextField: (props: CampoMockProps) => {
    formTextFieldMock(props);

    return <div data-testid={`text-field-${props.name}`} />;
  },

  FormSelectField: (props: CampoMockProps) => {
    formSelectFieldMock(props);

    return <div data-testid={`select-field-${props.name}`} />;
  },

  FormDateRangeField: (props: CampoMockProps) => {
    formDateRangeFieldMock(props);

    return <div data-testid="date-range-field" />;
  },
}));

vi.mock("@/components/form/FormComboboxField", () => ({
  FormComboboxField: (props: CampoMockProps) => {
    formComboboxFieldMock(props);

    return <div data-testid={`combobox-field-${props.name}`} />;
  },
}));

vi.mock("@/components/form/FormMultiSelectField", () => ({
  FormMultiSelectField: (props: CampoMockProps) => {
    formMultiSelectFieldMock(props);

    return <div data-testid={`multi-select-field-${props.name}`} />;
  },
}));

const empresasOpcoes = [
  {
    label: "Empresa Um",
    value: "empresa-uuid-1",
  },
  {
    label: "Empresa Dois",
    value: "empresa-uuid-2",
  },
];

const diretoriasRegionaisOpcoes = [
  {
    label: "DRE PENHA",
    value: "1",
  },
  {
    label: "DRE BUTANTÃ",
    value: "2",
  },
];

function renderizarFormLote() {
  return render(
    <FormLote
      empresasOpcoes={empresasOpcoes}
      diretoriasRegionaisOpcoes={diretoriasRegionaisOpcoes}
    />,
  );
}

describe("FormLote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza os campos de código de cadastro e nome", () => {
    const { getByTestId } = renderizarFormLote();

    expect(getByTestId("text-field-codigo_cadastro")).toBeInTheDocument();
    expect(getByTestId("text-field-nome")).toBeInTheDocument();

    expect(formTextFieldMock).toHaveBeenCalledWith({
      name: "codigo_cadastro",
      label: "Código de cadastro",
      placeholder: "Digite o código...",
    });

    expect(formTextFieldMock).toHaveBeenCalledWith({
      name: "nome",
      label: "Nome",
      placeholder: "Digite o nome do lote",
    });

    expect(formTextFieldMock).toHaveBeenCalledTimes(2);
  });

  it("renderiza o multiselect com as opções de DRE", () => {
    const { getByTestId } = renderizarFormLote();

    expect(
      getByTestId("multi-select-field-diretorias_regionais"),
    ).toBeInTheDocument();

    expect(formMultiSelectFieldMock).toHaveBeenCalledWith({
      name: "diretorias_regionais",
      label: "DRE",
      placeholder: "Selecione uma ou mais opções",
      options: diretoriasRegionaisOpcoes,
    });

    expect(formMultiSelectFieldMock).toHaveBeenCalledTimes(1);
  });

  it("renderiza o campo de status com as opções configuradas", () => {
    const { getByTestId } = renderizarFormLote();

    expect(getByTestId("select-field-status")).toBeInTheDocument();

    expect(formSelectFieldMock).toHaveBeenCalledWith({
      name: "status",
      label: "Status",
      placeholder: "Selecione",
      options: STATUS_OPCOES,
    });

    expect(formSelectFieldMock).toHaveBeenCalledTimes(1);
  });

  it("renderiza o combobox com as opções de empresas", () => {
    const { getByTestId } = renderizarFormLote();

    expect(getByTestId("combobox-field-empresa")).toBeInTheDocument();

    expect(formComboboxFieldMock).toHaveBeenCalledWith({
      name: "empresa",
      label: "Empresa",
      placeholder: "Digite o nome da empresa...",
      searchPlaceholder: "Digite o CNPJ ou nome da empresa...",
      emptyMessage: "Nenhuma empresa encontrada.",
      helperText: "Pesquise pelo CNPJ ou nome da empresa",
      options: empresasOpcoes,
    });

    expect(formComboboxFieldMock).toHaveBeenCalledTimes(1);
  });

  it("renderiza o campo de período da licitação", () => {
    const { getByTestId } = renderizarFormLote();

    expect(getByTestId("date-range-field")).toBeInTheDocument();

    expect(formDateRangeFieldMock).toHaveBeenCalledWith({
      nameInicial: "periodo_inicial",
      nameFinal: "periodo_final",
      label: "Período da licitação",
    });

    expect(formDateRangeFieldMock).toHaveBeenCalledTimes(1);
  });

  it("renderiza todos os campos do formulário", () => {
    const { getByTestId } = renderizarFormLote();

    expect(getByTestId("text-field-codigo_cadastro")).toBeInTheDocument();
    expect(getByTestId("text-field-nome")).toBeInTheDocument();

    expect(
      getByTestId("multi-select-field-diretorias_regionais"),
    ).toBeInTheDocument();

    expect(getByTestId("select-field-status")).toBeInTheDocument();
    expect(getByTestId("combobox-field-empresa")).toBeInTheDocument();
    expect(getByTestId("date-range-field")).toBeInTheDocument();
  });
});
