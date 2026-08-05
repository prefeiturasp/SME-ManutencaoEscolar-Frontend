"use client";

import { ListFilters } from "@/components/shared/ListFilters";
import type {
  ListFilterField,
  ListFilterValues,
} from "@/components/shared/types/ListFilters.type";
import { STATUS_OPCOES } from "@/constants";
import { maskCnpj, unmaskCnpj } from "@/utils/formatadores";

const FORNECEDOR_FILTER_FIELDS: readonly ListFilterField[] = [
  {
    name: "nome",
    label: "Nome",
    type: "text",
    placeholder: "Digite o nome da empresa...",
  },
  {
    name: "razao_social",
    label: "Razão social",
    type: "text",
    placeholder: "Digite a razão social",
  },
  {
    name: "cnpj",
    label: "CNPJ",
    type: "masked",
    placeholder: "00.000.000/0001-00",
    mask: maskCnpj,
    unmask: unmaskCnpj,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: STATUS_OPCOES,
  },
];

interface FornecedorFiltrosProps {
  readonly values: ListFilterValues;
  readonly onChange: (name: string, value: string) => void;
  readonly onSearch: () => void;
  readonly onClear: () => void;
}

export function FornecedorFiltros({
  values,
  onChange,
  onSearch,
  onClear,
}: FornecedorFiltrosProps) {
  return (
    <ListFilters
      description="Utilize o filtro para localizar as empresas."
      fields={FORNECEDOR_FILTER_FIELDS}
      searchLabel="Buscar empresas"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
    />
  );
}
