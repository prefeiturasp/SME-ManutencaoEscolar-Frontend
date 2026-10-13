"use client";

import { PlusIcon } from "@/components/icons/plus";
import { Paginacao } from "@/components/navigation/paginacao/Paginacao";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEmpresas } from "@/features/empresa/hooks/useEmpresas";
import { useEquipes } from "@/features/equipe/hooks/useEquipes";
import type { EquipeListParams, FiltroEquipeValues } from "@/features/equipe/types/equipe.types";
import { useLotes } from "@/features/lotes/hooks/useLotes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { criarColunasEquipe } from "./ColunasEquipe";
import { EquipeFiltros } from "./EquipeFiltros";
import { TabelaEquipe } from "./TabelaEquipe";

const FILTROS_INICIAIS: FiltroEquipeValues = { nome: "", empresa: "", lote: "", status: "" };
type FiltrosAplicados = EquipeListParams & { page_size: number };

export function EquipeLista() {
  const router = useRouter();
  const [valores, setValores] = useState(FILTROS_INICIAIS);
  const [filtros, setFiltros] = useState<FiltrosAplicados>({ page: 1, page_size: 10 });
  const { data, isLoading, isFetching, isError } = useEquipes(filtros);
  const { data: respostaEmpresas } = useEmpresas({ page_size: "all" });
  const { data: respostaLotes } = useLotes({ page: 1, page_size: "all" });
  const empresas = Array.isArray(respostaEmpresas)
    ? respostaEmpresas
    : (respostaEmpresas?.results ?? []);
  const lotes = respostaLotes?.results ?? [];

  const equipes = (data?.results ?? []).map((equipe) => {
    const loteEquipe = equipe.lote;

    return {
      ...equipe,
      lote:
        typeof loteEquipe === "object"
          ? loteEquipe
          : (lotes.find(
              (lote) => lote.uuid === loteEquipe || String(lote.id) === String(loteEquipe),
            ) ?? loteEquipe),
    };
  });

  const totalRegistros = data?.count ?? 0;
  const possuiFiltros =
    filtros.nome !== undefined ||
    filtros.empresa !== undefined ||
    filtros.lote !== undefined ||
    filtros.situacao !== undefined;
  const colunas = useMemo(
    () =>
      criarColunasEquipe({
        onEditar: (equipe) => router.push(`/empresas/equipes/${equipe.uuid}/editar`),
      }),
    [router],
  );

  function handleBuscar() {
    setFiltros({
      nome: valores.nome.trim() || undefined,
      empresa: valores.empresa || undefined,
      lote: valores.lote || undefined,
      situacao: valores.status ? valores.status === "ativo" : undefined,
      page: 1,
      page_size: filtros.page_size,
    });
  }
  function handleLimpar() {
    setValores(FILTROS_INICIAIS);
    setFiltros({ page: 1, page_size: filtros.page_size });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray">Equipes</h1>
        <Button asChild variant="default" size="big-lg">
          <Link href="/empresas/equipes/cadastrar" className="flex items-center gap-2">
            <PlusIcon />
            Cadastrar equipe
          </Link>
        </Button>
      </div>
      <Card className="gap-0 p-6">
        <div className="flex flex-col text-gray">
          <EquipeFiltros
            valores={valores}
            opcoesEmpresas={empresas.map((empresa) => ({
              label: empresa.nome,
              value: empresa.uuid || String(empresa.id),
            }))}
            opcoesLotes={lotes.map((lote) => ({
              label: lote.nome || lote.codigo_cadastro,
              value: lote.uuid || String(lote.id),
            }))}
            onMudar={(campo, valor) => setValores((atuais) => ({ ...atuais, [campo]: valor }))}
            onBuscar={handleBuscar}
            onLimpar={handleLimpar}
          />
          <section className="mb-4 flex flex-col gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray">Equipes cadastradas</h2>
              <p className="mt-2 mb-4 text-sm text-gray">
                Estas são as equipes que já estão cadastradas no sistema.
              </p>
            </div>
            <LoadingGlobal local exibir={isLoading} titulo="Carregando as equipes..." />
            {!isLoading && isError && <p role="alert">Não foi possível carregar as equipes.</p>}
            {!isLoading &&
              !isError &&
              totalRegistros === 0 &&
              (possuiFiltros ? (
                <ListaVazio
                  titulo="Não encontramos dados para esta busca"
                  descricao="Experimente remover alguns filtros ou selecionar outros critérios de busca."
                />
              ) : (
                <ListaVazio
                  titulo="Não há equipes cadastradas"
                  descricao="Que tal cadastrar a primeira equipe agora?"
                  textoBotao="Cadastrar equipe"
                  href="/empresas/equipes/cadastrar"
                />
              ))}
            {!isLoading && !isError && totalRegistros > 0 && (
              <TabelaEquipe equipes={equipes} colunas={colunas} atualizando={isFetching} />
            )}
          </section>
          {!isLoading && !isError && totalRegistros > 0 && (
            <Paginacao
              paginaAtual={filtros.page}
              totalRegistros={totalRegistros}
              registrosPorPagina={filtros.page_size}
              onMudarPagina={(page) => setFiltros((atuais) => ({ ...atuais, page }))}
              onMudarRegistrosPorPagina={(page_size) =>
                setFiltros((atuais) => ({ ...atuais, page: 1, page_size }))
              }
            />
          )}
        </div>
      </Card>
    </div>
  );
}
