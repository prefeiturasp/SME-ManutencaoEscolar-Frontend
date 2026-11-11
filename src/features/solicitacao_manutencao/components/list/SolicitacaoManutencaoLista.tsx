"use client";

import { PlusIcon } from "@/components/icons/plus";
import { Paginacao } from "@/components/navigation/paginacao/Paginacao";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { TabelaDeDados } from "@/components/shared/TabelaDeDados/TabelaDeDados";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOpcoesSolicitacaoManutencao } from "@/features/solicitacao_manutencao/hooks/useOpcoesSolicitacaoManutencao";
import { useSolicitacoesManutencao } from "@/features/solicitacao_manutencao/hooks/useSolicitacoesManutencao";
import type {
  SolicitacaoManutencaoFiltrosValues,
  SolicitacaoManutencaoResumo,
} from "@/features/solicitacao_manutencao/types/solicitacaoManutencao.types";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import Link from "next/link";
import { useState } from "react";
import { criarColunasSolicitacaoManutencao } from "./ColunasSolicitacaoManutencao";
import { SolicitacaoManutencaoFiltros } from "./SolicitacaoManutencaoFiltros";
import { EnviarSolicitacaoDreModal } from "./EnviarSolicitacaoDreModal";

const FILTROS_INICIAIS: SolicitacaoManutencaoFiltrosValues = {
  codigo: "",
  solicitante: [],
  servico: [],
  unidade_educacional: "",
  servidor_responsavel: "",
  fase: [],
  situacao: [],
  tipo_atendimento: [],
  data_envio_after: "",
  data_envio_before: "",
};
const ROTA_CADASTRO = "/solicitacao_manutencao/nova-solicitacao";

export function SolicitacaoManutencaoLista() {
  const ehGestorDre = useUsuarioStore((state) => state.usuario?.perfil?.codigo === "DRE");
  const fases = useOpcoesSolicitacaoManutencao("fases");
  const situacoes = useOpcoesSolicitacaoManutencao("situacoes");
  const tipos = useOpcoesSolicitacaoManutencao("tipos-atendimento");
  const [solicitacaoParaEnviar, setSolicitacaoParaEnviar] =
    useState<SolicitacaoManutencaoResumo | null>(null);
  const colunas = criarColunasSolicitacaoManutencao({
    fases: fases.data ?? [],
    situacoes: situacoes.data ?? [],
    tipos: tipos.data ?? [],
    onEnviar: setSolicitacaoParaEnviar,
  });
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [aplicados, setAplicados] = useState(FILTROS_INICIAIS);
  const [pagina, setPagina] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const { data, isLoading, isFetching, isError } = useSolicitacoesManutencao({
    codigo: aplicados.codigo || undefined,
    fase: aplicados.fase.join(",") || undefined,
    situacao: aplicados.situacao.join(",") || undefined,
    tipo_atendimento: aplicados.tipo_atendimento.join(",") || undefined,
    data_envio_before: aplicados.data_envio_before || undefined,
    data_envio_after: aplicados.data_envio_after || undefined,
    ...(ehGestorDre
      ? {
          solicitante: aplicados.solicitante.join(",") || undefined,
          servico: aplicados.servico.join(",") || undefined,
          unidade_educacional: aplicados.unidade_educacional || undefined,
          servidor_responsavel: aplicados.servidor_responsavel.trim() || undefined,
        }
      : {}),
    page: pagina,
    page_size: registrosPorPagina,
  });
  const solicitacoes = data?.results ?? [];
  const total = data?.count ?? 0;
  const filtrosComuns = {
    codigo: aplicados.codigo,
    fase: aplicados.fase,
    situacao: aplicados.situacao,
    tipo_atendimento: aplicados.tipo_atendimento,
    data_envio_after: aplicados.data_envio_after,
    data_envio_before: aplicados.data_envio_before,
  };
  const possuiFiltros = Object.values(ehGestorDre ? aplicados : filtrosComuns).some(
    (valor) => valor.length > 0,
  );

  function buscar() {
    const normalizados = {
      ...filtros,
      codigo: filtros.codigo.trim(),
      servidor_responsavel: filtros.servidor_responsavel.trim(),
    };
    setFiltros(normalizados);
    setAplicados(normalizados);
    setPagina(1);
  }

  function limpar() {
    setFiltros(FILTROS_INICIAIS);
    setAplicados(FILTROS_INICIAIS);
    setPagina(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-gray">Solicitações de manutenção</h1>
        <Button asChild variant="default" size="big-lg">
          <Link href={ROTA_CADASTRO} className="flex items-center gap-2">
            <PlusIcon />
            Nova solicitação
          </Link>
        </Button>
      </div>
      <Card className="gap-4 p-6">
        <SolicitacaoManutencaoFiltros
          ehGestorDre={ehGestorDre}
          values={filtros}
          onChange={(campo, valor) => setFiltros((atuais) => ({ ...atuais, [campo]: valor }))}
          onSearch={buscar}
          onClear={limpar}
        />
        <CardHeader className="p-0">
          <CardTitle className="text-xl font-bold text-gray">Solicitações cadastradas</CardTitle>
          <CardDescription>
            Estas são as solicitações que já estão cadastradas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <LoadingGlobal local exibir={isLoading} titulo="Carregando as solicitações..." />
          {!isLoading && isError && (
            <p role="alert" className="my-4 text-center text-sm text-gray">
              Não foi possível carregar as solicitações.
            </p>
          )}
          {!isLoading &&
            !isError &&
            (total === 0 ? (
              <ListaVazio
                titulo={
                  possuiFiltros
                    ? "Não encontramos dados para esta busca"
                    : "Não há solicitações cadastradas"
                }
                descricao={
                  possuiFiltros
                    ? "Experimente remover alguns filtros ou selecionar outros critérios de busca."
                    : "Que tal cadastrar a primeira solicitação agora?"
                }
                textoBotao={possuiFiltros ? "" : "Nova solicitação"}
                href={ROTA_CADASTRO}
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <div className="min-w-[760px]">
                    <TabelaDeDados
                      dados={solicitacoes}
                      colunas={colunas}
                      obterChave={(solicitacao) => solicitacao.uuid}
                      atualizando={isFetching}
                    />
                  </div>
                </div>
                <Paginacao
                  paginaAtual={pagina}
                  totalRegistros={total}
                  registrosPorPagina={registrosPorPagina}
                  onMudarPagina={setPagina}
                  onMudarRegistrosPorPagina={(quantidade) => {
                    setRegistrosPorPagina(quantidade);
                    setPagina(1);
                  }}
                />
              </>
            ))}
        </CardContent>
      </Card>
      {solicitacaoParaEnviar && (
        <EnviarSolicitacaoDreModal
          key={solicitacaoParaEnviar.uuid}
          uuid={solicitacaoParaEnviar.uuid}
          onFechar={() => setSolicitacaoParaEnviar(null)}
        />
      )}
    </div>
  );
}
