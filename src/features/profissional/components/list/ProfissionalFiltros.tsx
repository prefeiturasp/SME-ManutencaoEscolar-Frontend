"use client";

import { useMemo } from "react";

import { FiltrosLista } from "@/components/shared/FiltroLista/FiltroLista";
import type { FiltroListaRow } from "@/components/shared/FiltroLista/types/FiltroLista.type";
import { STATUS_OPCOES } from "@/constants/constants";
import { useListarCargos } from "@/features/cargo/hooks/useListarCargo";
import type { ProfissionalFiltrosValues } from "@/features/profissional/types/profissional.types";
import { maskCpf, unmaskCpf } from "@/utils/formatadores";

interface ProfissionalFiltrosProps {
  readonly values: ProfissionalFiltrosValues;
  readonly onChange: (name: keyof ProfissionalFiltrosValues, value: string) => void;
  readonly onSearch: () => void;
  readonly onClear: () => void;
}

export function ProfissionalFiltros({
  values,
  onChange,
  onSearch,
  onClear,
}: ProfissionalFiltrosProps) {
  const { data: respostaCargos } = useListarCargos({ page_size: "all" });

  const fields = useMemo<readonly FiltroListaRow<ProfissionalFiltrosValues>[]>(() => {
    const opcoesCargo =
      respostaCargos?.results.flatMap((cargo) =>
        cargo.uuid ? [{ value: cargo.uuid, label: cargo.nome }] : [],
      ) ?? [];

    return [
      [
        {
          name: "nome",
          label: "Nome do profissional",
          type: "text",
          placeholder: "Digite o nome...",
        },
        {
          name: "rg",
          label: "Registro geral (RG)",
          type: "text",
          placeholder: "Digite o RG...",
        },
      ],
      [
        {
          name: "cpf",
          label: "CPF",
          type: "masked",
          placeholder: "000.000.000-00",
          mask: maskCpf,
          unmask: unmaskCpf,
        },
        {
          name: "funcao",
          label: "Funções",
          type: "select",
          options: opcoesCargo,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: STATUS_OPCOES,
        },
      ],
    ];
  }, [respostaCargos]);

  return (
    <FiltrosLista
      description="Utilize o filtro para localizar os profissionais."
      fields={fields}
      searchLabel="Buscar profissionais"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
    />
  );
}
