"use client";

import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { Button } from "@/components/ui/button";
import {
  decisaoDreSchema,
  type DecisaoDreFormData,
} from "@/features/solicitacao_manutencao/schemas/analiseDreSchema";
import { buscarSolicitacaoManutencaoAction } from "@/features/solicitacao_manutencao/services/buscarSolicitacaoManutencao.api";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { DecisaoDre } from "./DecisaoDre";
import { DetalhesSolicitacaoManutencao } from "./DetalhesSolicitacaoManutencao";
import { EnviarSolicitacaoGmeSmeModal } from "./EnviarSolicitacaoGmeSmeModal";

export function AnalisarSolicitacaoManutencaoPage({ uuid }: Readonly<{ uuid: string }>) {
  return <AnaliseDre key={uuid} uuid={uuid} />;
}

function AnaliseDre({ uuid }: Readonly<{ uuid: string }>) {
  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { isValid, isSubmitting },
  } = useForm<DecisaoDreFormData>({
    resolver: zodResolver(decisaoDreSchema),
    mode: "onChange",
  });
  const [dataAlteracao, setDataAlteracao] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const ehDre = useUsuarioStore((state) => state.usuario?.perfil?.codigo === "DRE");
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["solicitacoes-manutencao", "detalhe", uuid],
    queryFn: () => buscarSolicitacaoManutencaoAction(uuid),
    enabled: ehDre,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
  const podeSalvar =
    ehDre &&
    !isPending &&
    !isError &&
    data?.situacao === "aguardando_analise_dre" &&
    isValid &&
    !isSubmitting;

  function renderizarConteudo() {
    if (!ehDre)
      return <p role="alert">A análise da solicitação está disponível apenas para o perfil DRE.</p>;
    if (isPending) return <LoadingGlobal local exibir titulo="Carregando a solicitação..." />;
    if (isError)
      return (
        <div role="alert" className="space-y-3">
          <p>Não foi possível carregar a solicitação.</p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      );
    if (data.situacao !== "aguardando_analise_dre")
      return <p role="alert">Esta solicitação não está aguardando análise da DRE.</p>;
    return (
      <>
        <DetalhesSolicitacaoManutencao solicitacao={data} exibirSituacao />
        <Controller
          name="situacao"
          control={control}
          render={({ field, fieldState }) => (
            <DecisaoDre
              situacao={field.value ?? ""}
              onBlur={() => {
                field.onBlur();
                void trigger("situacao");
              }}
              erro={fieldState.error?.message}
              dataAlteracao={
                dataAlteracao
                  ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(
                      new Date(dataAlteracao),
                    )
                  : ""
              }
              onChange={(valor) => {
                field.onChange(valor);
                setDataAlteracao(new Date().toISOString());
              }}
            />
          )}
        />
        {modalAberto && (
          <EnviarSolicitacaoGmeSmeModal
            uuid={uuid}
            decisao={getValues("situacao")}
            dataAlteracao={dataAlteracao}
            onFechar={() => setModalAberto(false)}
          />
        )}
      </>
    );
  }

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={handleSubmit(() => {
        if (podeSalvar) setModalAberto(true);
      })}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Detalhes da solicitação</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="big-xxs">
            <Link href="/solicitacao_manutencao">Voltar</Link>
          </Button>
          <Button type="submit" variant={podeSalvar ? "default" : "blocked"} disabled={!podeSalvar}>
            Salvar
          </Button>
        </div>
      </div>
      {renderizarConteudo()}
    </form>
  );
}
