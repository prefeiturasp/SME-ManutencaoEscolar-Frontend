"use client";

import { FiltrosLista } from "@/components/shared/FiltroLista/FiltroLista";
import type {
  FiltroListaRow,
  FiltroListaValues,
} from "@/components/shared/FiltroLista/types/FiltroLista.type";
import { STATUS_OPCOES } from "@/constants/constants";
import { maskCnpj, unmaskCnpj } from "@/utils/formatadores";

const EMPRESA_FILTER_FIELDS: readonly FiltroListaRow[] = [
  [
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
  ],
  [
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
  ],
];

interface EmpresaFiltrosProps {
  readonly values: FiltroListaValues;
  readonly onChange: (name: string, value: string) => void;
  readonly onSearch: () => void;
  readonly onClear: () => void;
}

export function EmpresaFiltros({
  values,
  onChange,
  onSearch,
  onClear,
}: EmpresaFiltrosProps) {
  return (
    <FiltrosLista
      description="Utilize o filtro para localizar as empresas."
      fields={EMPRESA_FILTER_FIELDS}
      searchLabel="Buscar empresas"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
    />
  );
}
