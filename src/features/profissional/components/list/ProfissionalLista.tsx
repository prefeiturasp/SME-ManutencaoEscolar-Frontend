"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { PlusIcon } from "@/components/icons/plus";
import type { FiltroListaValues } from "@/components/shared/FiltroLista/types/FiltroLista.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Paginacao } from "@/components/navigation/paginacao/Paginacao";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { useProfissionais } from "@/features/profissional/hooks/useProfissionais";
import { criarColunasProfissional } from "./ColunasProfissional";
import { ProfissionalFiltros } from "./ProfissionalFiltros";
import { TabelaProfissional } from "./TabelaProfissional";

const FILTROS_INICIAIS: FiltroListaValues = {
  nome: "",
  rg: "",
  cpf: "",
  funcao: "",
  status: "",
};

export function ProfissionalLista() {
  const [filtros, setFiltros] = useState<FiltroListaValues>(FILTROS_INICIAIS);
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltroListaValues>(FILTROS_INICIAIS);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data, isLoading, isError } = useProfissionais({
    nome: filtrosAplicados.nome || undefined,
    rg: filtrosAplicados.rg || undefined,
    cpf: filtrosAplicados.cpf || undefined,
    funcao: filtrosAplicados.funcao || undefined,
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

  const profissionais = data?.results ?? [];
  const total = data?.count ?? 0;
  const possuiFiltrosAplicados = Object.values(filtrosAplicados).some((valor) => valor !== "");
  const tituloListaVazia = possuiFiltrosAplicados
    ? "Não encontramos dados para esta busca"
    : "Não há profissionais cadastrados";
  const descricaoListaVazia = possuiFiltrosAplicados
    ? "Experimente remover alguns filtros ou selecionar outros critérios de busca."
    : "Que tal cadastrar o primeiro profissional agora?";
  const colunas = useMemo(
    () =>
      criarColunasProfissional({
        onEditar: () => {
          /*Será implementado em breve*/
        },
      }),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray">Profissionais</h1>

        <Button asChild variant="default">
          <Link href="/profissionais/cadastrar" className="flex items-center gap-2">
            <PlusIcon />
            Cadastrar profissional
          </Link>
        </Button>
      </div>

      <Card className="p-6 gap-4">
        <ProfissionalFiltros
          values={filtros}
          onChange={handleFiltroChange}
          onSearch={handleBuscar}
          onClear={handleLimparFiltros}
        />

        <CardHeader className="p-0">
          <CardTitle className="text-gray text-xl font-bold">Profissionais cadastrados</CardTitle>
          <CardDescription>
            Estes são os profissionais que já estão cadastrados no sistema.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <LoadingGlobal local exibir={isLoading} titulo="Carregando os profissionais..." />

          {!isLoading && isError && (
            <div className="flex flex-col items-center justify-center text-center my-4">
              <p role="alert" className="text-sm text-gray">
                Não foi possível carregar os profissionais.
              </p>
            </div>
          )}

          {!isLoading &&
            !isError &&
            (total === 0 ? (
              <ListaVazio
                titulo={tituloListaVazia}
                descricao={descricaoListaVazia}
                textoBotao={possuiFiltrosAplicados ? "" : "Cadastrar profissional"}
                href="/profissionais/cadastrar"
              />
            ) : (
              <>
                <TabelaProfissional
                  profissionais={profissionais}
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
