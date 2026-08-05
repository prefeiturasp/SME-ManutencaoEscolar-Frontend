"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { PlusIcon } from "@/components/icons/plus";
import type { ListFilterValues } from "@/components/shared/types/ListFilters.type";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useFornecedores } from "../../hooks/useFornecedores";
import { FornecedorFiltros } from "./FornecedorFiltros";
import { TabelaFornecedor } from "./TabelaFornecedor";
import { criarColunasFornecedor } from "./ColunasFornecedor";
import { Paginacao } from "@/components/navigation/paginacao/Paginacao";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";

const FILTROS_INICIAIS: ListFilterValues = {
  nome: "",
  razao_social: "",
  cnpj: "",
  status: "",
};

const PER_PAGE_PADRAO = 10;

export function FornecedorLista() {
  const [filtros, setFiltros] = useState<ListFilterValues>(FILTROS_INICIAIS);
  const [filtrosAplicados, setFiltrosAplicados] =
    useState<ListFilterValues>(FILTROS_INICIAIS);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE_PADRAO);

  const { data, isLoading } = useFornecedores({
    nome: filtrosAplicados.nome || undefined,
    razao_social: filtrosAplicados.razao_social || undefined,
    cnpj: filtrosAplicados.cnpj || undefined,
    status: filtrosAplicados.status || undefined,
    page,
    page_size: perPage,
  });

  function handleFiltroChange(name: string, value: string) {
    setFiltros((atual) => ({ ...atual, [name]: value }));
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

  const fornecedores = data?.results ?? [];
  const total = data?.count ?? 0;
  const possuiFiltrosAplicados = Object.values(filtrosAplicados).some(
    (valor) => valor !== "",
  );
  const tituloListaVazia = possuiFiltrosAplicados
    ? "Não encontramos dados para esta busca"
    : "Não há empresas cadastradas";
  const descricaoListaVazia = possuiFiltrosAplicados
    ? "Experimente remover alguns filtros ou selecionar outros critérios de busca."
    : "Que tal cadastrar a primeira empresa agora?";
  const colunas = useMemo(
    () =>
      criarColunasFornecedor({
        onEditar: (fornecedor) => {
          console.log("Editar fornecedor:", fornecedor);
        },
      }),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray">Empresas</h1>

        <Button asChild variant="default">
          <Link
            href="/cadastro/empresas/cadastrar"
            className="flex items-center gap-2"
          >
            <PlusIcon />
            Cadastrar empresa
          </Link>
        </Button>
      </div>

      <Card className="p-6 gap-4">
        <FornecedorFiltros
          values={filtros}
          onChange={handleFiltroChange}
          onSearch={handleBuscar}
          onClear={handleLimparFiltros}
        />

        <CardHeader className="p-0">
          <CardTitle className="text-gray text-xl font-bold">
            Empresas cadastradas
          </CardTitle>
          <CardDescription>
            Estas são as empresas que já estão cadastradas no sistema.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Carregando empresas...
            </p>
          ) : (
            <>
              {total === 0 ? (
                <ListaVazio
                  titulo={tituloListaVazia}
                  descricao={descricaoListaVazia}
                  textoBotao={possuiFiltrosAplicados ? "" : "Cadastrar empresa"}
                  href="/cadastro/empresas/cadastrar"
                />
              ) : (
                <>
                  <TabelaFornecedor
                    fornecedores={fornecedores}
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
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
