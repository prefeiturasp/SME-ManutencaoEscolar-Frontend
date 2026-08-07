"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Paginacao } from "@/components/navigation/paginacao/Paginacao";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";

import { PlusIcon } from "@/components/icons/plus";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useListarServicos } from "../../hooks/useListarServico";
import type {
  FiltrosServico as FiltrosServicoType,
  Servico,
  StatusFiltro,
} from "../../types/servicos.types";
import { criarColunasServico } from "./colunasServico";
import { FiltrosServico } from "./FiltrosServico";
import { TabelaServico } from "./TabelaServico";

export function ListarServico() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [status, setStatus] = useState<StatusFiltro>("");

  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosServicoType>({
    page: 1,
    page_size: 10,
  });

  const { data, isLoading, isFetching, isError } =
    useListarServicos(filtrosAplicados);

  const servicos = data?.results ?? [];
  const totalRegistros = data?.count ?? 0;

  const paginaAtual = filtrosAplicados.page ?? 1;
  const registrosPorPagina = filtrosAplicados.page_size ?? 10;

  const possuiFiltrosAplicados =
    filtrosAplicados.nome !== undefined ||
    filtrosAplicados.status !== undefined;

  const colunas = useMemo(
    () =>
      criarColunasServico({
        onEditar: handleEditar,
      }),
    [],
  );

  function handleEditar(servico: Servico) {
    console.log("Editar serviço:", servico);
  }

  function handleMudarPagina(novaPagina: number) {
    setFiltrosAplicados((filtrosAtuais) => ({
      ...filtrosAtuais,
      page: novaPagina,
    }));
  }

  function handleMudarRegistrosPorPagina(quantidade: number) {
    setFiltrosAplicados((filtrosAtuais) => ({
      ...filtrosAtuais,
      page: 1,
      page_size: quantidade,
    }));
  }

  function handleBuscar() {
    let statusFiltro: boolean | undefined;

    if (status === "ativo") {
      statusFiltro = true;
    }

    if (status === "inativo") {
      statusFiltro = false;
    }

    setFiltrosAplicados({
      nome: nome.trim() || undefined,
      status: statusFiltro,
      page: 1,
      page_size: registrosPorPagina,
    });
  }

  function handleLimparFiltros() {
    setNome("");
    setStatus("");

    setFiltrosAplicados({
      page: 1,
      page_size: registrosPorPagina,
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray">Serviços</h1>
        <Button asChild variant="default" size="big-lg">
          <Link
            href="/cadastro/servicos/cadastrar"
            className="flex items-center gap-2"
          >
            <PlusIcon />
            Cadastrar serviços
          </Link>
        </Button>
      </div>
      <Card className="gap-0 p-6">
        <CardTitle className="text-xl font-bold text-gray">
          Refine sua busca
        </CardTitle>

        <CardDescription className="mt-1 text-sm">
          Utilize o filtro para localizar os serviços cadastrados.
        </CardDescription>
        <div className=" flex flex-col mt-4 text-gray">
          <FiltrosServico
            nome={nome}
            servicos={servicos}
            status={status}
            onMudarNome={setNome}
            onMudarStatus={setStatus}
            onBuscar={handleBuscar}
            onLimpar={handleLimparFiltros}
          />

          <section className="flex flex-col gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray">
                Serviços cadastrados
              </h2>

              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Estes são os serviços que já estão cadastrados no sistema.
              </p>
            </div>

            <LoadingGlobal
              local
              exibir={isLoading}
              titulo="Carregando os serviços..."
            />

            {!isLoading && isError && (
              <p role="alert">Não foi possível carregar os serviços.</p>
            )}

            {!isLoading &&
              !isError &&
              totalRegistros === 0 &&
              possuiFiltrosAplicados && (
                <ListaVazio
                  titulo="Não encontramos dados para esta busca"
                  descricao="Experimente remover alguns filtros ou selecionar outros critérios de busca."
                />
              )}

            {!isLoading &&
              !isError &&
              totalRegistros === 0 &&
              !possuiFiltrosAplicados && (
                <ListaVazio
                  titulo="Não há serviços cadastrados"
                  descricao="Que tal cadastrar o primeiro serviço agora?"
                  textoBotao="Cadastrar serviço"
                  href="/cadastro/servicos/cadastrar"
                />
              )}

            {!isLoading && !isError && totalRegistros > 0 && (
              <TabelaServico
                servicos={servicos}
                colunas={colunas}
                atualizando={isFetching}
              />
            )}
          </section>

          {!isLoading && !isError && totalRegistros > 0 && (
            <Paginacao
              paginaAtual={paginaAtual}
              totalRegistros={totalRegistros}
              registrosPorPagina={registrosPorPagina}
              onMudarPagina={handleMudarPagina}
              onMudarRegistrosPorPagina={handleMudarRegistrosPorPagina}
            />
          )}
        </div>
      </Card>
    </>
  );
}
