"use client";

import { FiltrosLista } from "@/components/shared/FiltroLista/FiltroLista";
import { FiltroListaRow } from "@/components/shared/FiltroLista/types/FiltroLista.type";
import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import { useTodosSubprefeituras } from "@/features/subprefeitura/hooks/useSubprefeitura";
import { useTodosTiposUnidades } from "@/features/tipo_unidade/hooks/useTipoUnidade";
import { useTodasUnidadesEducacionais } from "@/features/unidade_educacional/hooks/useUnidadeEducacional";
import { FiltrosUnidadeEducacionalProps, UnidadeEducacional } from "@/features/unidade_educacional/types/unidadesEducacionais.types";
import { useMemo } from "react";

const STATUS_OPTIONS = [
  { value: "true", label: "Ativo" },
  { value: "false", label: "Inativo" },
];

export function UnidadeEducacionalFiltros({
  values,
  onChange,
  onBuscar,
  onLimpar,
}: Readonly<FiltrosUnidadeEducacionalProps>) {

  const {data: tiposUnidades} =  useTodosTiposUnidades();
  const tipoUnidadeSelecionadaUuuid = values.tipo_escola

  const { data: diretoriasRegionais } = useListarDiretoriasRegionais();
  const diretoriaSelecionadaId = values.diretoria_regional;

  const { data: subprefeituras } = useTodosSubprefeituras(
    diretoriaSelecionadaId,
  );
  const subprefeiturasSelecionadaUuid = values.subprefeitura

  const { data: unidadesEducacionais } = useTodasUnidadesEducacionais(
    diretoriaSelecionadaId, tipoUnidadeSelecionadaUuuid, subprefeiturasSelecionadaUuid,
    {enabled:  Boolean(diretoriaSelecionadaId || subprefeiturasSelecionadaUuid)}
  );


  const fields = useMemo<readonly FiltroListaRow[]>(() => {
    const tipoUnidadeOptions =
      tiposUnidades?.map((tipo) => ({
        value: String(tipo.uuid),
        label: tipo.sigla,
      })) ?? [];

    const diretoriaRegionalOptions =
      diretoriasRegionais?.results?.map((diretoria) => ({
        value: String(diretoria.id),
        label: diretoria.nome_curto,
      })) ?? [];

    const subprefeituraOptions = [
      { value: "sem-subprefeitura",
        label: "Nenhuma",
      },
      ...(subprefeituras?.map((subprefeitura) => ({
        value: String(subprefeitura.uuid),
        label: subprefeitura.nome,
      })) ?? []),
    ]
      

    const unidadeEducacionalOptions =
      unidadesEducacionais?.map((unidade: UnidadeEducacional) => ({
        value: String(unidade.uuid),
        label: unidade.nome,
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
          options: tipoUnidadeOptions,
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
          options: subprefeituraOptions,
        },
        {
          name: "unidade_educacional",
          label: "Unidade Educacional",
          type: "select",
          placeholder: "Selecione",
          options: unidadeEducacionalOptions,
          disabled: (values) => !values.diretoria_regional && !values.subprefeitura,
          tooltip: "Selecione uma DRE ou Subprefeitura para habilitar o campo.",
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
  }, [tiposUnidades, diretoriasRegionais, subprefeituras, unidadesEducacionais]);

  return (
    <FiltrosLista
      description="Utilize o filtro para localizar as Unidades Educacionais"
      fields={fields}
      searchLabel="Buscar Unidade Educacional"
      values={values}
      onChange={onChange}
      onSearch={onBuscar}
      onClear={onLimpar}
    />
  );
}
