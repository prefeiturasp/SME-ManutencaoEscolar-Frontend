// features/unidade_educacional/FiltrosUnidadeEducacional.tsx

"use client";

import { Search } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import type { FiltrosUnidadeEducacionalProps } from "@/features/unidade_educacional/types/unidadesEducacionais.types";
import { CampoSelectFiltro, CampoSelectFiltroOption } from "./CampoSelectFiltro";

const TIPO_ESCOLA_OPTIONS: CampoSelectFiltroOption[] = [];

const UNIDADE_EDUCACIONAL_OPTIONS: CampoSelectFiltroOption[] = [];

const SUBPREFEITURA_OPTIONS: CampoSelectFiltroOption[] = [];

const STATUS_OPTIONS: CampoSelectFiltroOption[] = [
  {
    value: "ativo",
    label: "Ativo",
  },
  {
    value: "inativo",
    label: "Inativo",
  },
];

export function UnidadeEducacionalFiltros({
  values,
  onChange,
  onBuscar,
  onLimpar,
}: Readonly<FiltrosUnidadeEducacionalProps>) {
  const { data: diretoriasRegionais } = useListarDiretoriasRegionais();

  const diretoriaRegionalOptions = useMemo<CampoSelectFiltroOption[]>(
    () =>
      diretoriasRegionais?.results?.map((diretoria) => ({
        value: String(diretoria.id),
        label: diretoria.nome_curto,
      })) ?? [],
    [diretoriasRegionais],
  );

  const dreSelecionada = Boolean(values.diretoria_regional);

  const unidadeEducacionalSelecionada = Boolean(
    values.unidade_educacional,
  );

  function handleDreChange(value: string) {
    onChange("diretoria_regional", value);
    onChange("unidade_educacional", "");
    onChange("subprefeitura", "");
  }

  function handleUnidadeEducacionalChange(value: string) {
    onChange("unidade_educacional", value);
    onChange("subprefeitura", "");
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-[20px] font-bold text-gray">
          Refine sua busca
        </h2>

        <p className="text-sm text-muted-foreground">
          Utilize o filtro para localizar as Unidades Escolares
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Primeira linha: 3 x 401px + 2 x 16px */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="codigo_eol">CODESC (Código EOL)</Label>

            <Input
              id="codigo_eol"
              placeholder="1234567"
              value={values.codigo_eol ?? ""}
              onChange={(event) =>
                onChange("codigo_eol", event.target.value)
              }
            />
          </div>

          <CampoSelectFiltro
            id="tipo_escola"
            label="Tipo de escola"
            value={values.tipo_escola ?? ""}
            placeholder="Selecione"
            options={TIPO_ESCOLA_OPTIONS}
            onChange={(value) => onChange("tipo_escola", value)}
          />

          <CampoSelectFiltro
            id="diretoria_regional"
            label="Diretoria Regional de Educação (DRE)"
            value={values.diretoria_regional ?? ""}
            placeholder="Selecione"
            options={diretoriaRegionalOptions}
            onChange={handleDreChange}
          />
        </div>

        {/* Segunda linha: 4 x 296.75px + 3 x 16px */}
        <div className="grid grid-cols-4 gap-4">
          <CampoSelectFiltro
            id="unidade_educacional"
            label="Unidade Educacional"
            value={values.unidade_educacional ?? ""}
            placeholder="Selecione"
            options={UNIDADE_EDUCACIONAL_OPTIONS}
            disabled={!dreSelecionada}
            tooltip={
              !dreSelecionada
                ? "Selecione uma DRE para habilitar o campo."
                : undefined
            }
            onChange={handleUnidadeEducacionalChange}
          />

          <CampoSelectFiltro
            id="subprefeitura"
            label="Subprefeitura"
            value={values.subprefeitura ?? ""}
            placeholder="Selecione"
            options={SUBPREFEITURA_OPTIONS}
            disabled={!unidadeEducacionalSelecionada}
            tooltip={
              !unidadeEducacionalSelecionada
                ? "Selecione uma UE para habilitar o campo."
                : undefined
            }
            onChange={(value) => onChange("subprefeitura", value)}
          />

          <div className="space-y-1">
            <Label htmlFor="lote">Lote</Label>

            <Input
              id="lote"
              placeholder="Exemplo: 001"
              value={values.lote ?? ""}
              onChange={(event) =>
                onChange("lote", event.target.value)
              }
            />
          </div>

          <CampoSelectFiltro
            id="status"
            label="Status"
            value={values.status ?? ""}
            placeholder="Selecione"
            options={STATUS_OPTIONS}
            onChange={(value) => onChange("status", value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onLimpar}
          className="bg-white"
        >
          Limpar filtros
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onBuscar}
          className="bg-white"
        >
          <Search />
          Buscar Unidade Educacional
        </Button>
      </div>
    </section>
  );
}