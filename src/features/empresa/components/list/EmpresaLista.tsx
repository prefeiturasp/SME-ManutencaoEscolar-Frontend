"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PlusIcon } from "@/components/icons/plus";
import type { FiltroListaValues } from "@/components/shared/FiltroLista/types/FiltroLista.type";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Paginacao } from "@/components/navigation/paginacao/Paginacao";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { useEmpresas } from "@/features/empresa/hooks/useEmpresas";
import { criarColunasEmpresa } from "./ColunasEmpresa";
import { EmpresaFiltros } from "./EmpresaFiltros";
import { TabelaEmpresa } from "./TabelaEmpresa";

const FILTROS_INICIAIS: FiltroListaValues = {
  nome: "",
  razao_social: "",
  cnpj: "",
  status: "",
};

const PER_PAGE_PADRAO = 10;

const MENSAGEM_ERRO_LISTA = "Não foi possível carregar as empresas.";

export function EmpresaLista() {
  const router = useRouter();
  const [filtros, setFiltros] = useState<FiltroListaValues>(FILTROS_INICIAIS);
  const [filtrosAplicados, setFiltrosAplicados] =
    useState<FiltroListaValues>(FILTROS_INICIAIS);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE_PADRAO);

  const { data, isLoading, isError } = useEmpresas({
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

  const empresas = data?.results ?? [];
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
      criarColunasEmpresa({
        onEditar: (empresa) => {
          router.push(`/empresas/${empresa.uuid}/editar`);
        },
      }),
    [router],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray">Empresas</h1>

        <Button asChild variant="default">
          <Link
            href="/empresas/cadastrar"
            className="flex items-center gap-2"
          >
            <PlusIcon />
            Cadastrar empresa
          </Link>
        </Button>
      </div>

      <Card className="p-6 gap-4">
        <EmpresaFiltros
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
          <LoadingGlobal
            local
            exibir={isLoading}
            titulo="Carregando as empresas..."
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
                textoBotao={possuiFiltrosAplicados ? "" : "Cadastrar empresa"}
                href="/empresas/cadastrar"
              />
            ) : (
              <>
                <TabelaEmpresa
                  empresas={empresas}
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
