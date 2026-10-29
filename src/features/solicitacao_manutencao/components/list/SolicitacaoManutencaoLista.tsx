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
import type { SolicitacaoManutencaoFiltrosValues } from "@/features/solicitacao_manutencao/types/solicitacaoManutencao.types";
import Link from "next/link";
import { useState } from "react";
import { criarColunasSolicitacaoManutencao } from "./ColunasSolicitacaoManutencao";
import { SolicitacaoManutencaoFiltros } from "./SolicitacaoManutencaoFiltros";

const FILTROS_INICIAIS: SolicitacaoManutencaoFiltrosValues = {
  codigo: "",
  fase: [],
  situacao: [],
  tipo_atendimento: [],
  data_envio_after: "",
  data_envio_before: "",
};
const ROTA_CADASTRO = "/solicitacao_manutencao/nova-solicitacao";

export function SolicitacaoManutencaoLista() {
  const fases = useOpcoesSolicitacaoManutencao("fases");
  const situacoes = useOpcoesSolicitacaoManutencao("situacoes");
  const tipos = useOpcoesSolicitacaoManutencao("tipos-atendimento");
  const colunas = criarColunasSolicitacaoManutencao({
    fases: fases.data ?? [],
    situacoes: situacoes.data ?? [],
    tipos: tipos.data ?? [],
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
    page: pagina,
    page_size: registrosPorPagina,
  });
  const solicitacoes = data?.results ?? [];
  const total = data?.count ?? 0;
  const possuiFiltros = Object.values(aplicados).some((valor) => valor.length > 0);

  function buscar() {
    const normalizados = { ...filtros, codigo: filtros.codigo.trim() };
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
    </div>
  );
}
