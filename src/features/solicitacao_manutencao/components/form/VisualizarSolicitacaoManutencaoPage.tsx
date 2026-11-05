"use client";

import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { Button } from "@/components/ui/button";
import { buscarSolicitacaoManutencaoAction } from "@/features/solicitacao_manutencao/services/buscarSolicitacaoManutencao.api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DadosSolicitacaoManutencao } from "./DadosSolicitacaoManutencao";
import { InformacoesAdicionais } from "./InformacoesAdicionais";
import { VisualizarServicosManutencao } from "./VisualizarServicosManutencao";
import { InformacoesUE } from "./informacoes_ue/InformacoesUE";

export function VisualizarSolicitacaoManutencaoPage({ uuid }: Readonly<{ uuid: string }>) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["solicitacoes-manutencao", "detalhe", uuid],
    queryFn: () => buscarSolicitacaoManutencaoAction(uuid),
    refetchOnWindowFocus: false,
  });
  const ue = data?.unidade_educacional;
  const podeEditar =
    !isError &&
    (data?.situacao === "necessidade_revisao_ue" || data?.situacao === "nao_enviado_dre");
  const hrefEditar = podeEditar ? `/solicitacao_manutencao/${uuid}/editar` : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Detalhes da solicitação</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="big-xxs">
            <Link href="/solicitacao_manutencao">Voltar</Link>
          </Button>
          {hrefEditar ? (
            <Button asChild variant="default" size="big-md">
              <Link href={hrefEditar} className="flex items-center gap-2">
                Editar solicitação
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="big-md"
              disabled
              className="disabled:pointer-events-auto disabled:cursor-not-allowed"
            >
              Editar solicitação
            </Button>
          )}
        </div>
      </div>
      <LoadingGlobal local exibir={isPending} titulo="Carregando a solicitação..." />
      {isError && (
        <div role="alert" className="space-y-3">
          <p>Não foi possível carregar a solicitação.</p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}
      {data && !isError && (
        <>
          <InformacoesUE
            dados={{
              codesc: ue?.codigo_eol,
              tipoEscola: ue?.tipo_escola?.sigla,
              dre: ue?.diretoria_regional?.nome_curto ?? ue?.diretoria_regional?.nome,
              unidadeEducacional: ue?.nome,
              subprefeitura: ue?.subprefeitura?.nome,
              lote: ue?.lote?.nome,
              cep: ue?.dados?.cep,
              logradouro: ue?.dados?.logradouro,
              numero: ue?.dados?.numero,
              bairro: ue?.dados?.bairro,
              cidade: ue?.dados?.municipio,
              estado: ue?.dados?.uf,
            }}
          />
          <DadosSolicitacaoManutencao valor={data.tipo_atendimento} somenteLeitura />
          <VisualizarServicosManutencao servicos={data.servicos} hrefEditar={hrefEditar} />
          <InformacoesAdicionais valor={data.informacoes_adicionais} somenteLeitura />
        </>
      )}
    </div>
  );
}
