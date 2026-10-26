"use client";

import { FiltroMultiSelectField } from "@/components/filtro/FiltroMultiSelectField";
import { DateRangeField } from "@/components/shared/DateRangeField/DateRangeField";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useOpcoesSolicitacaoManutencao } from "../../hooks/useOpcoesSolicitacaoManutencao";
import type { SolicitacaoManutencaoFiltrosProps } from "../../types/solicitacaoManutencao.types";

export function SolicitacaoManutencaoFiltros({
  values,
  onChange,
  onSearch,
  onClear,
}: SolicitacaoManutencaoFiltrosProps) {
  const fases = useOpcoesSolicitacaoManutencao("fases");
  const situacoes = useOpcoesSolicitacaoManutencao("situacoes");
  const tipos = useOpcoesSolicitacaoManutencao("tipos_atendimento");
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      {[fases, situacoes, tipos].some((consulta) => consulta.isError) && (
        <p role="alert">
          Não foi possível carregar as opções dos filtros.{" "}
          <button
            type="button"
            onClick={() => {
              for (const consulta of [fases, situacoes, tipos])
                if (consulta.isError) void consulta.refetch();
            }}
          >
            Tentar novamente
          </button>
        </p>
      )}
      <CardHeader className="p-0">
        <CardTitle className="text-xl font-bold text-gray">Refine sua busca</CardTitle>
        <CardDescription>
          Utilize o filtro para localizar as solicitações cadastradas.
        </CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="codigo-solicitacao">Número da solicitação</Label>
          <Input
            id="codigo-solicitacao"
            placeholder="Exemplo: 1234567"
            value={values.codigo}
            onChange={(event) => onChange("codigo", event.target.value)}
          />
        </div>
        <FiltroMultiSelectField
          id="fase-solicitacao"
          label="Fase"
          value={values.fase}
          options={fases.data ?? []}
          disabled={fases.isPending || fases.isError}
          onChange={(value) => onChange("fase", value)}
        />
        <FiltroMultiSelectField
          id="situacao-solicitacao"
          label="Situação"
          value={values.situacao}
          options={situacoes.data ?? []}
          disabled={situacoes.isPending || situacoes.isError}
          onChange={(value) => onChange("situacao", value)}
        />
      </div>
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <FiltroMultiSelectField
          id="atendimento-solicitacao"
          label="Tipo de atendimento"
          value={values.tipo_atendimento}
          options={tipos.data ?? []}
          disabled={tipos.isPending || tipos.isError}
          onChange={(value) => onChange("tipo_atendimento", value)}
        />
        <div className="[&>div]:block [&>div]:space-y-1 [&_label]:leading-none [&_label]:text-gray">
          <DateRangeField
            id="data-envio-solicitacao"
            label="Data de envio"
            variant="filter"
            dataInicial={values.data_envio_after}
            dataFinal={values.data_envio_before}
            onMudarDataInicial={(value) => onChange("data_envio_after", value)}
            onMudarDataFinal={(value) => onChange("data_envio_before", value)}
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" className="bg-white" onClick={onClear}>
          Limpar filtros
        </Button>
        <Button type="submit" variant="outline" className="bg-white">
          <Search />
          Buscar solicitação
        </Button>
      </div>
    </form>
  );
}
