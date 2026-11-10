"use client";

import { FiltroComboBoxField } from "@/components/filtro/FiltroComboBoxField";
import { FiltroMultiSelectField } from "@/components/filtro/FiltroMultiSelectField";
import { Label } from "@/components/ui/label";
import { useOpcoesServicos } from "@/features/servico/hooks/useOpcoesServicos";
import { useTodasUnidadesEducacionais } from "@/features/unidade_educacional/hooks/useUnidadesEducacionais";
import { useUsuarioStore } from "@/stores/useUsuarioStore";

function ErroConsulta({
  mensagem,
  onTentarNovamente,
}: Readonly<{ mensagem: string; onTentarNovamente: () => void }>) {
  return (
    <p role="alert" className="text-sm text-destructive">
      {mensagem}{" "}
      <button type="button" className="underline" onClick={onTentarNovamente}>
        Tentar novamente
      </button>
    </p>
  );
}

export function FiltroServicoGestorDre({
  value,
  onChange,
}: Readonly<{ value: string[]; onChange: (value: string[]) => void }>) {
  const servicos = useOpcoesServicos();
  return (
    <div className="space-y-1 md:col-span-2">
      <FiltroMultiSelectField
        id="servico-solicitacao"
        label="Serviço"
        value={value}
        options={servicos.data ?? []}
        disabled={servicos.isPending || servicos.isError}
        onChange={onChange}
      />
      {servicos.isError && (
        <ErroConsulta
          mensagem="Não foi possível carregar os serviços."
          onTentarNovamente={() => void servicos.refetch()}
        />
      )}
    </div>
  );
}

export function FiltroUnidadeEducacionalGestorDre({
  value,
  onChange,
}: Readonly<{ value: string; onChange: (value: string) => void }>) {
  const dreId = useUsuarioStore((state) => {
    const unidade = state.usuario?.unidadeEducacional;
    return typeof unidade === "object" && unidade !== null
      ? unidade.diretoria_regional?.id
      : undefined;
  });
  const diretoriaRegional = dreId === undefined ? undefined : String(dreId);
  const unidades = useTodasUnidadesEducacionais(
    { diretoria_regional: diretoriaRegional },
    { enabled: Boolean(diretoriaRegional) },
  );
  const opcoes =
    unidades.data?.map((unidade) => ({
      value: unidade.uuid,
      label: unidade.nome || unidade.codigo_eol,
    })) ?? [];
  return (
    <div className="space-y-1 md:col-span-2">
      <Label htmlFor="unidade-solicitacao">Unidade Educacional</Label>
      <FiltroComboBoxField
        id="unidade-solicitacao"
        aria-label="Unidade Educacional"
        value={value}
        options={opcoes}
        disabled={
          !diretoriaRegional || unidades.isPending || unidades.isError || unidades.isPlaceholderData
        }
        onChange={onChange}
        searchPlaceholder="Pesquise a unidade educacional..."
      />
      {!diretoriaRegional && (
        <p className="text-sm text-muted-foreground">
          O usuário precisa ter uma DRE vinculada para listar as unidades.
        </p>
      )}
      {unidades.isError && (
        <ErroConsulta
          mensagem="Não foi possível carregar as unidades educacionais."
          onTentarNovamente={() => void unidades.refetch()}
        />
      )}
    </div>
  );
}
