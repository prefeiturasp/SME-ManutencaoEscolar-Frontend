"use client";

import { FiltrosLista } from "@/components/shared/FiltroLista/FiltroLista";
import type { FiltroListaRow } from "@/components/shared/FiltroLista/types/FiltroLista.type";
import type { FiltroEquipeValues, OpcaoFiltroEquipe } from "@/features/equipe/types/equipe.types";
import { useMemo } from "react";

type EquipeFiltrosProps = {
  valores: FiltroEquipeValues;
  opcoesEmpresas: OpcaoFiltroEquipe[];
  opcoesLotes: OpcaoFiltroEquipe[];
  onMudar: (campo: keyof FiltroEquipeValues, valor: string) => void;
  onBuscar: () => void;
  onLimpar: () => void;
};

export function EquipeFiltros({
  valores,
  opcoesEmpresas,
  opcoesLotes,
  onMudar,
  onBuscar,
  onLimpar,
}: Readonly<EquipeFiltrosProps>) {
  const fields = useMemo<readonly FiltroListaRow<FiltroEquipeValues>[]>(
    () => [
      [
        {
          name: "nome",
          label: "Nome da equipe",
          type: "text",
          placeholder: "Exemplo: Serralheria Leste",
        },
        { name: "empresa", label: "Empresa", type: "select", options: opcoesEmpresas },
      ],
      [
        {
          name: "lote",
          label: "Lote",
          type: "select",
          options: opcoesLotes,
        },
        {
          name: "status",
          label: "Situação",
          type: "select",
          options: [
            { label: "Ativo", value: "ativo" },
            { label: "Inativo", value: "inativo" },
          ],
        },
      ],
    ],
    [opcoesEmpresas, opcoesLotes],
  );

  return (
    <form
      className="mb-4 flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onBuscar();
      }}
    >
      <FiltrosLista<FiltroEquipeValues>
        description="Utilize o filtro para localizar as equipes."
        fields={fields}
        searchLabel="Buscar equipe"
        values={valores}
        onChange={onMudar}
        onSearch={onBuscar}
        onClear={onLimpar}
      />
    </form>
  );
}
