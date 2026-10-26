"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormError } from "@/components/form/FormError";
import { Button } from "@/components/ui/button";
import { useCriarSolicitacaoManutencao } from "@/features/solicitacao_manutencao/hooks/useCriarSolicitacaoManutencao";
import { solicitacaoManutencaoSchema } from "@/features/solicitacao_manutencao/schemas/solicitacaoManutencaoSchema";
import { useSolicitacaoManutencaoEnviadaStore } from "@/features/solicitacao_manutencao/stores/useSolicitacaoManutencaoEnviadaStore";
import type { SolicitacaoManutencaoFormData } from "@/features/solicitacao_manutencao/types/solicitacaoManutencao.types";
import { useFeedbackEntidade } from "@/hooks/useFeedbackEntidade";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { ConfirmarSolicitacaoManutencaoModal } from "./ConfirmarSolicitacaoManutencaoModal";
import { DadosSolicitacaoManutencao } from "./DadosSolicitacaoManutencao";
import { InformacoesUE } from "./informacoes_ue/InformacoesUE";
import { InformacoesAdicionais } from "./InformacoesAdicionais";
import { ServicosManutencao } from "./ServicosManutencao";

export default function CadastrarSolicitacaoManutencaoPage() {
  const router = useRouter();
  const enviarParaAprovacaoRef = useRef(false);
  const { tratarResultado, tratarErroInesperado } = useFeedbackEntidade({
    mensagemSucesso: () =>
      enviarParaAprovacaoRef.current
        ? "A solicitação foi enviada com sucesso."
        : "A solicitação foi criada com sucesso.",
    contextoErro: "cadastrar solicitação",
    rotaRetorno: "/solicitacao_manutencao",
    erroEmToast: true,
    redirecionarEmErro: true,
    mensagemErro: "Não conseguimos registrar a solicitação. Por favor, tente novamente.",
  });
  const { mutate, isPending } = useCriarSolicitacaoManutencao();
  const envioEmAndamento = useRef(false);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [dadosPendentes, setDadosPendentes] = useState<SolicitacaoManutencaoFormData>();
  const usuario = useUsuarioStore((state) => state.usuario);
  const unidade = usuario?.unidadeEducacional;
  const ue = typeof unidade === "object" && unidade !== null ? unidade : undefined;
  const informacoesUE = {
    codesc: ue?.codigo_eol,
    tipoEscola: ue?.tipo_escola?.sigla,
    dre:
      ue?.diretoria_regional?.nome_curto ??
      ue?.diretoria_regional?.nome ??
      usuario?.diretoriaRegional ??
      undefined,
    unidadeEducacional: ue?.nome ?? (typeof unidade === "string" ? unidade : undefined),
    subprefeitura: ue?.subprefeitura?.nome,
    lote: ue?.lote?.nome,
    cep: ue?.dados?.cep,
    logradouro: ue?.dados?.logradouro,
    numero: ue?.dados?.numero,
    bairro: ue?.dados?.bairro,
    cidade: ue?.dados?.municipio,
    estado: ue?.dados?.uf,
  };
  const {
    control,
    setValue,
    handleSubmit,
    trigger,
    formState: { isValid, isSubmitting, errors },
  } = useForm<SolicitacaoManutencaoFormData>({
    resolver: zodResolver(solicitacaoManutencaoSchema),
    mode: "onChange",
    defaultValues: { unidade_educacional: "", servicos: [], informacoes_adicionais: "" },
  });
  useEffect(() => {
    setValue("unidade_educacional", ue?.uuid ?? "", { shouldValidate: true });
  }, [ue?.uuid, setValue]);
  const botaoDesabilitado = !isValid || isSubmitting || isPending || !ue?.uuid;

  function onSubmit(dados: SolicitacaoManutencaoFormData) {
    setDadosPendentes(dados);
    setConfirmacaoAberta(true);
  }

  function confirmar(enviarParaAprovacao: boolean) {
    if (!dadosPendentes || envioEmAndamento.current) return;
    enviarParaAprovacaoRef.current = enviarParaAprovacao;
    envioEmAndamento.current = true;
    mutate(
      {
        ...dadosPendentes,
        servicos: dadosPendentes.servicos.map((servico) => ({
          servico: servico.servico,
          ...(servico.servico === "outros"
            ? { servico_especifico: servico.servico_especifico }
            : {}),
          local_reparo: servico.local_reparo,
          descricao: servico.descricao,
          arquivos: servico.arquivos.map((arquivo) => ({ arquivo: [arquivo] })),
        })),
        enviar: enviarParaAprovacao,
      },
      {
        onSuccess: (resultado) => {
          setConfirmacaoAberta(false);
          if (resultado.success) {
            useSolicitacaoManutencaoEnviadaStore.getState().abrir(resultado.codigo, enviarParaAprovacao);
          }
          tratarResultado(resultado);
        },
        onError: (error) => {
          setConfirmacaoAberta(false);
          tratarErroInesperado(error);
          router.replace("/solicitacao_manutencao");
        },
        onSettled: () => {
          envioEmAndamento.current = false;
        },
      },
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Nova solicitação</h1>

          <div className="flex gap-2">
            <Button asChild type="button" variant="outline" size="big-lg" className="max-w-[88px]">
              <Link href="/solicitacao_manutencao">Cancelar</Link>
            </Button>

            <Button
              type="submit"
              size="big-xxs"
              disabled={botaoDesabilitado}
              variant={botaoDesabilitado ? "blocked" : "default"}
            >
              Salvar
            </Button>
          </div>
        </div>
        <InformacoesUE dados={informacoesUE} className="mt-4" />
        {!ue?.uuid && (
          <FormError message="O usuário logado precisa ter uma unidade educacional vinculada." />
        )}
        <Controller
          name="tipo_atendimento"
          control={control}
          render={({ field, fieldState }) => (
            <DadosSolicitacaoManutencao
              valor={field.value ?? ""}
              onChange={field.onChange}
              onBlur={() => {
                field.onBlur();
                void trigger("tipo_atendimento");
              }}
              erro={fieldState.isTouched ? fieldState.error?.message : undefined}
            />
          )}
        />
        <Controller
          name="servicos"
          control={control}
          render={({ field }) => (
            <ServicosManutencao valor={field.value} onChange={field.onChange} />
          )}
        />
        {errors.servicos?.message && <FormError message={errors.servicos.message} />}
        <Controller
          name="informacoes_adicionais"
          control={control}
          render={({ field }) => (
            <InformacoesAdicionais valor={field.value} onChange={field.onChange} />
          )}
        />
      </form>
      <ConfirmarSolicitacaoManutencaoModal
        aberto={confirmacaoAberta}
        onOpenChange={setConfirmacaoAberta}
        onSalvar={() => confirmar(false)}
        onEnviar={() => confirmar(true)}
        processando={isPending}
      />
    </>
  );
}
