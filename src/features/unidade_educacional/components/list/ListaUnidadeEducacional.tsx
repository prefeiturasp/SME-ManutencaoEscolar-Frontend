"use client";

import { Paginacao } from "@/components/navigation/paginacao/Paginacao";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { FiltroListaValues } from "@/components/shared/FiltroLista/types/FiltroLista.type";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { useUnidadeEducacional } from "@/features/unidade_educacional/hooks/useUnidadeEducacional";
import { criarColunasUnidadeEducacional } from "./ColunaUnidadeEducacional";
import { UnidadeEducacionalFiltros } from "./FiltrosUnidadeEducacional";
import { TabelaUnidadeEducional } from "./TabelaUnidadeEducacional";

const FILTROS_INICIAIS: FiltroListaValues = {
  codigo_eol: "",
  tipo_escola: "",
  diretoria_regional: "",
  unidade_educacional: "",
  subprefeitura: "",
  lote: "",
  status: "",
};

const PER_PAGE_PADRAO = 10;

const MENSAGEM_ERRO_LISTA =
  "Não foi possível carregar as unidades educacionais.";

export function UnidadeEducacionalLista() {
  const router = useRouter();
  const [filtros, setFiltros] = useState<FiltroListaValues>(FILTROS_INICIAIS);
  const [filtrosAplicados, setFiltrosAplicados] =
    useState<FiltroListaValues>(FILTROS_INICIAIS);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE_PADRAO);

  const params = {
    codigo_eol: filtrosAplicados.codigo_eol || undefined,
    diretoria_regional: filtrosAplicados.diretoria_regional || undefined,
    unidade_educacional: filtrosAplicados.unidade_educacional || undefined,
    page,
    page_size: perPage,
  };
  
  const { data, isLoading, isError } = useUnidadeEducacional(Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ),);

  function handleFiltroChange(name: string, value: string) {
    setFiltros((atual) => ({
      ...atual,
      [name]: value,
    }));
  }

  function handleBuscar() {
    setFiltrosAplicados(filtros);
    setPage(1);
  }

  function handleLimparFiltros() {
    setFiltros(FILTROS_INICIAIS);
    setFiltrosAplicados(FILTROS_INICIAIS);
    setPage(1);
  }

  function handlePerPageChange(novoPerPage: number) {
    setPerPage(novoPerPage);
    setPage(1);
  }

  const unidades = data?.results ?? [];
  const total = data?.count ?? 0;
  const possuiFiltrosAplicados = Object.values(filtrosAplicados).some(
    (valor) => valor !== "",
  );
  const tituloListaVazia = possuiFiltrosAplicados
    ? "Não encontramos dados para esta busca"
    : "Não há unidades cadastradas";
  const descricaoListaVazia = possuiFiltrosAplicados
    ? "Experimente remover alguns filtros ou selecionar outros critérios de busca."
    : "Que tal cadastrar a primeira unidades agora?";
  const colunas = useMemo(
    () =>
      criarColunasUnidadeEducacional({
        onEditar: (unidadeEducacional) => {
          router.push(
            `/cadastro/unidades-educacionais/${unidadeEducacional.uuid}/editar`,
          );
        },
      }),
    [router],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray">Unidade Educacional</h1>
      </div>

      <Card className="p-6 gap-4">
        <UnidadeEducacionalFiltros
          values={filtros}
          onChange={handleFiltroChange}
          onBuscar={handleBuscar}
          onLimpar={handleLimparFiltros}
        />

        <CardHeader className="p-0">
          <CardTitle className="text-gray text-xl font-bold">
            Unidades Educacionais cadastradas
          </CardTitle>
          <CardDescription>
            Estas são as UEs que já estão cadastradas no sistema.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <LoadingGlobal
            local
            exibir={isLoading}
            titulo="Carregando as Unidades Educacionais..."
          />

          {!isLoading && isError && (
            <div className="flex flex-col items-center justify-center text-center my-4">
              <p role="alert" className="text-sm text-gray">
                {MENSAGEM_ERRO_LISTA}
              </p>
            </div>
          )}

          {!isLoading &&
            !isError &&
            (total === 0 ? (
              <ListaVazio
                titulo={tituloListaVazia}
                descricao={descricaoListaVazia}
                textoBotao={""}
                href=""
              />
            ) : (
              <>
                <TabelaUnidadeEducional
                  unidades={unidades}
                  colunas={colunas}
                  atualizando={isLoading}
                />

                <Paginacao
                  paginaAtual={page}
                  totalRegistros={total}
                  registrosPorPagina={perPage}
                  onMudarPagina={setPage}
                  onMudarRegistrosPorPagina={handlePerPageChange}
                />
              </>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
