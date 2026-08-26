"use client";

import { PlusIcon } from "@/components/icons/plus";
import { Paginacao } from "@/components/navigation/paginacao/Paginacao";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import { useEmpresas } from "@/features/empresa/hooks/useEmpresas";
import { useLotes } from "@/features/lotes/hooks/useLotes";
import type { LoteListParams } from "@/features/lotes/types/lotes.types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { criarColunasLote } from "./ColunasLote";
import { LoteFiltros } from "./LoteFiltros";
import { TabelaLote } from "./TabelaLote";

type StatusFiltro = "" | "ativo" | "inativo";

const PAGINA_INICIAL = 1;
const REGISTROS_POR_PAGINA = 10;

function converterDataParaApi(data: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return data;
  }

  const dataNormalizada = data.replaceAll("/", "-");
  const [dia, mes, ano] = dataNormalizada.split("-");

  return `${ano}-${mes}-${dia}`;
}

export function ListarLotes() {
  const router = useRouter();

  const [codigoCadastro, setCodigoCadastro] = useState("");
  const [nome, setNome] = useState("");
  const [status, setStatus] = useState<StatusFiltro>("");
  const [empresa, setEmpresa] = useState("");
  const [diretoriasRegionais, setDiretoriasRegionais] = useState<string[]>([]);
  const [periodoInicial, setPeriodoInicial] = useState("");
  const [periodoFinal, setPeriodoFinal] = useState("");

  const [filtrosAplicados, setFiltrosAplicados] = useState<LoteListParams>({
    page: PAGINA_INICIAL,
    page_size: REGISTROS_POR_PAGINA,
  });

  const { data, isLoading, isFetching, isError } = useLotes(filtrosAplicados);

  const lotes = data?.results ?? [];
  const totalRegistros = data?.count ?? 0;

  const paginaAtual = filtrosAplicados.page ?? PAGINA_INICIAL;

  const registrosPorPagina = filtrosAplicados.page_size ?? REGISTROS_POR_PAGINA;

  const possuiFiltrosAplicados =
    filtrosAplicados.codigo_cadastro !== undefined ||
    filtrosAplicados.nome !== undefined ||
    filtrosAplicados.status !== undefined ||
    filtrosAplicados.empresa !== undefined ||
    filtrosAplicados.diretorias_regionais !== undefined ||
    filtrosAplicados.periodo_inicial !== undefined ||
    filtrosAplicados.periodo_final !== undefined;

  const colunas = useMemo(
    () =>
      criarColunasLote({
        onEditar: (lote) => {
          router.push(`/cadastro/lotes/${lote.uuid}/editar`);
        },
      }),
    [router],
  );

  const { data: respostaEmpresas } = useEmpresas({
    page_size: "all",
  });

  const empresas = Array.isArray(respostaEmpresas)
    ? respostaEmpresas
    : (respostaEmpresas?.results ?? []);

  const opcoesEmpresas = empresas.map((empresaItem) => ({
    label: empresaItem.nome,
    value: String(empresaItem.uuid),
  }));

  const { data: respostaDiretoriasRegionais } = useListarDiretoriasRegionais();

  const opcoesDiretoriasRegionais =
    respostaDiretoriasRegionais?.results.map((diretoriaRegional) => ({
      label: diretoriaRegional.nome_curto || diretoriaRegional.nome,
      value: String(diretoriaRegional.id),
    })) ?? [];

  function handleMudarPagina(novaPagina: number) {
    setFiltrosAplicados((filtrosAtuais) => ({
      ...filtrosAtuais,
      page: novaPagina,
    }));
  }

  function handleMudarRegistrosPorPagina(quantidade: number) {
    setFiltrosAplicados((filtrosAtuais) => ({
      ...filtrosAtuais,
      page: PAGINA_INICIAL,
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
      codigo_cadastro: codigoCadastro.trim() || undefined,
      nome: nome.trim() || undefined,
      status: statusFiltro,
      empresa: empresa ? Number(empresa) : undefined,
      diretorias_regionais:
        diretoriasRegionais.length > 0
          ? diretoriasRegionais.join(",")
          : undefined,
      periodo_inicial: periodoInicial
        ? converterDataParaApi(periodoInicial)
        : undefined,
      periodo_final: periodoFinal
        ? converterDataParaApi(periodoFinal)
        : undefined,
      page: PAGINA_INICIAL,
      page_size: registrosPorPagina,
    });
  }

  function handleLimparFiltros() {
    setCodigoCadastro("");
    setNome("");
    setStatus("");
    setEmpresa("");
    setDiretoriasRegionais([]);
    setPeriodoInicial("");
    setPeriodoFinal("");

    setFiltrosAplicados({
      page: PAGINA_INICIAL,
      page_size: registrosPorPagina,
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray">Lotes</h1>

        <Button asChild variant="default" size="big-lg">
          <Link
            href="/cadastro/lotes/cadastrar"
            className="flex items-center gap-2"
          >
            <PlusIcon />
            Cadastrar lote
          </Link>
        </Button>
      </div>

      <Card className="gap-0 p-6">
        <CardTitle className="text-xl font-bold text-gray">
          Refine sua busca
        </CardTitle>

        <CardDescription className="mt-2 text-sm text-gray">
          Utilize os filtros para localizar os lotes cadastrados.
        </CardDescription>

        <div className="mt-4 flex flex-col text-gray">
          <LoteFiltros
            codigoCadastro={codigoCadastro}
            nome={nome}
            status={status}
            empresa={empresa}
            diretoriasRegionais={diretoriasRegionais}
            periodoInicial={periodoInicial}
            periodoFinal={periodoFinal}
            opcoesEmpresas={opcoesEmpresas}
            opcoesDiretoriasRegionais={opcoesDiretoriasRegionais}
            onMudarCodigoCadastro={setCodigoCadastro}
            onMudarNome={setNome}
            onMudarStatus={setStatus}
            onMudarEmpresa={setEmpresa}
            onMudarDiretoriasRegionais={setDiretoriasRegionais}
            onMudarPeriodoInicial={setPeriodoInicial}
            onMudarPeriodoFinal={setPeriodoFinal}
            onBuscar={handleBuscar}
            onLimpar={handleLimparFiltros}
          />

          <section className="mb-4 flex flex-col gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray">Lotes cadastrados</h2>

              <p className="mt-2 mb-4 text-sm text-gray">
                Estes são os lotes que já estão cadastrados no sistema.
              </p>
            </div>

            <LoadingGlobal
              local
              exibir={isLoading}
              titulo="Carregando os lotes..."
            />

            {!isLoading && isError && (
              <p role="alert">Não foi possível carregar os lotes.</p>
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
                  titulo="Não há lotes cadastrados"
                  descricao="Que tal cadastrar o primeiro lote agora?"
                  textoBotao="Cadastrar lote"
                  href="/cadastro/lotes/cadastrar"
                />
              )}

            {!isLoading && !isError && totalRegistros > 0 && (
              <TabelaLote
                lotes={lotes}
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
