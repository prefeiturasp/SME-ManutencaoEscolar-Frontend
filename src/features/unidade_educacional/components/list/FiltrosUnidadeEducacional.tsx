"use client";

import { useMemo } from "react";

import { FiltrosLista } from "@/components/shared/FiltroLista/FiltroLista";
import type { FiltroListaRow } from "@/components/shared/FiltroLista/types/FiltroLista.type";
import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import { useTodasUnidadesEducacionais } from "@/features/unidade_educacional/hooks/useUnidadeEducacional";
import type { FiltrosUnidadeEducacionalProps, UnidadeEducacional } from "@/features/unidade_educacional/types/unidadesEducacionais.types";

const STATUS_OPTIONS = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
];

export function UnidadeEducacionalFiltros({
  values,
  onChange,
  onBuscar,
  onLimpar,
}: Readonly<FiltrosUnidadeEducacionalProps>) {
  const { data: diretoriasRegionais } = useListarDiretoriasRegionais();

  const diretoriaSelecionadaId = values.diretoria_regional;

  const { data: unidadesEducacionais } = useTodasUnidadesEducacionais(
    diretoriaSelecionadaId,
    { enabled: Boolean(diretoriaSelecionadaId) },
  );


  const fields = useMemo<readonly FiltroListaRow[]>(() => {
    const diretoriaRegionalOptions =
      diretoriasRegionais?.results?.map((diretoria) => ({
        value: String(diretoria.id),
        label: diretoria.nome_curto,
      })) ?? [];

    const unidadeEducacionalOptions =
      unidadesEducacionais?.map((unidade: UnidadeEducacional) => ({
        value: String(unidade.uuid),
        label: unidade.nome || unidade.codigo_eol || String(unidade.id),
      })) ?? [];

    return [
      [
        {
          name: "codigo_eol",
          label: "CODESC (Código EOL)",
          type: "text",
          placeholder: "1234567",
        },
        {
          name: "tipo_escola",
          label: "Tipo de escola",
          type: "select",
          placeholder: "Selecione",
          options: [],
        },
        {
          name: "diretoria_regional",
          label: "Diretoria Regional de Educação (DRE)",
          type: "select",
          placeholder: "Selecione",
          options: diretoriaRegionalOptions,
        },
      ],
      [
        {
          name: "subprefeitura",
          label: "Subprefeitura",
          type: "select",
          placeholder: "Selecione",
          options: [],
          disabled: (values) => !values.diretoria_regional,
          tooltip: "Selecione uma UE para habilitar o campo.",
        },
        {
          name: "unidade_educacional",
          label: "Unidade Educacional",
          type: "select",
          placeholder: "Selecione",
          options: unidadeEducacionalOptions,
          disabled: (values) => !values.diretoria_regional,
          tooltip: "Selecione uma DRE para habilitar o campo.",
        },
        {
          name: "lote",
          label: "Lote",
          type: "text",
          placeholder: "Exemplo: 001",
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          placeholder: "Selecione",
          options: STATUS_OPTIONS,
        },
      ],
    ];
  }, [diretoriasRegionais, unidadesEducacionais]);

  return (
    <FiltrosLista
      description="Utilize o filtro para localizar as Unidades Escolares"
      fields={fields}
      searchLabel="Buscar Unidade Educacional"
      values={values}
      onChange={onChange}
      onSearch={onBuscar}
      onClear={onLimpar}
    />
  );
}
