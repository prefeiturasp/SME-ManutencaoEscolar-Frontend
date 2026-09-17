"use client";

import { PlusIcon } from "@/components/icons/plus";
import { Paginacao } from "@/components/navigation/paginacao/Paginacao";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import Link from "next/link";

import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useListarCargos } from "../hooks/useListarCargo";
import {
  ExigeDocumentoFiltroCargo,
  FiltrosCargos,
} from "../types/cargos.types";
import { FiltrosCargo } from "./FiltrosCargo";
import { TabelaCargo } from "./TabelaCargo";
import { criarColunasCargo } from "./colunasCargo";

export function ListarCargo() {
  const [nome, setNome] = useState("");
  const [exigeDocumento, setExigeDocumento] =
    useState<ExigeDocumentoFiltroCargo>("");
  const router = useRouter();
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosCargos>({
    page: 1,
    page_size: 10,
  });

  const { data, isLoading, isFetching, isError } =
    useListarCargos(filtrosAplicados);

  const cargos = data?.results ?? [];
  const totalRegistros = data?.count ?? 0;

  const paginaAtual = filtrosAplicados.page ?? 1;
  const registrosPorPagina = filtrosAplicados.page_size ?? 10;

  const possuiFiltrosAplicados =
    filtrosAplicados.nome !== undefined ||
    filtrosAplicados.exige_documento !== undefined;

  const colunas = useMemo(
    () =>
      criarColunasCargo({
        onEditar: (cargo) => {
          router.push(`/cargos/${cargo.uuid}/editar`);
        },
      }),
    [router],
  );

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
    let exigeDocumentoFiltro: boolean | undefined;

    if (exigeDocumento === "sim") {
      exigeDocumentoFiltro = true;
    }

    if (exigeDocumento === "nao") {
      exigeDocumentoFiltro = false;
    }

    setFiltrosAplicados({
      nome: nome.trim() || undefined,
      exige_documento: exigeDocumentoFiltro,
      page: 1,
      page_size: registrosPorPagina,
    });
  }

  function handleLimparFiltros() {
    const possuiFiltro = nome.trim() !== "" || exigeDocumento !== "";
    if (possuiFiltro) {
      setNome("");
      setExigeDocumento("");
    }

    setFiltrosAplicados({
      page: 1,
      page_size: registrosPorPagina,
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray">Cargos</h1>
        <Button asChild variant="default" size="big-lg">
          <Link href="/cargos/cadastrar" className="flex items-center gap-2">
            <PlusIcon />
            Cadastrar cargo
          </Link>
        </Button>
      </div>
      <Card className="gap-0 p-6">
        <CardTitle className="text-xl font-bold text-gray">
          Refine sua busca
        </CardTitle>

        <CardDescription className="mt-2 text-sm">
          Utilize o filtro para localizar os cargos.
        </CardDescription>
        <div className=" flex flex-col mt-4 text-gray">
          <FiltrosCargo
            nome={nome}
            cargos={cargos}
            exige_documento={exigeDocumento}
            onMudarNome={setNome}
            onMudarExigeDocumento={setExigeDocumento}
            onBuscar={handleBuscar}
            onLimpar={handleLimparFiltros}
          />

          <section className="flex flex-col gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray">
                Cargos cadastrados
              </h2>

              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Estes são os cargos que já estão cadastrados no sistema.
              </p>
            </div>

            <LoadingGlobal
              local
              exibir={isLoading}
              titulo="Carregando os cargos..."
            />

            {!isLoading && isError && (
              <p role="alert">Não foi possível carregar os cargos.</p>
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
                  titulo="Não há cargos cadastrados"
                  descricao="Que tal cadastrar o primeiro cargo agora?"
                  textoBotao="Cadastrar cargo"
                  href="/cargos/cadastrar"
                />
              )}

            {!isLoading && !isError && totalRegistros > 0 && (
              <TabelaCargo
                cargos={cargos}
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
