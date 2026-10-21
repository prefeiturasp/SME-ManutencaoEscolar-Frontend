"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormError } from "@/components/form/FormError";
import { Button } from "@/components/ui/button";
import { useCriarSolicitacao } from "@/features/solicitacao/hooks/useCriarSolicitacao";
import { solicitacaoSchema } from "@/features/solicitacao/schemas/solicitacaoSchema";
import { useFeedbackEntidade } from "@/hooks/useFeedbackEntidade";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { useSolicitacaoEnviadaStore } from "../../stores/useSolicitacaoEnviadaStore";
import type { SolicitacaoFormData } from "../../types/solicitacao.types";
import { ConfirmarSolicitacaoModal } from "./ConfirmarSolicitacaoModal";
import { DadosSolicitacao } from "./DadosSolicitacao";
import { InformacoesAdicionais } from "./InformacoesAdicionais";
import { InformacoesUE } from "./InformacoesUE";
import { ServicosManutencao } from "./ServicosManutencao";

export default function CadastrarSolicitacaoPage() {
  const router = useRouter();
  const { tratarResultado, tratarErroInesperado } = useFeedbackEntidade({
    mensagemSucesso: "A solicitação foi enviada..",
    contextoErro: "cadastrar solicitação",
    rotaRetorno: "/solicitacao",
    erroEmToast: true,
    redirecionarEmErro: true,
    mensagemErro: "Não conseguimos registrar a solicitação. Por favor, tente novamente.",
  });
  const { mutate, isPending } = useCriarSolicitacao();
  const envioEmAndamento = useRef(false);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [dadosPendentes, setDadosPendentes] = useState<SolicitacaoFormData>();
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
  } = useForm<SolicitacaoFormData>({
    resolver: zodResolver(solicitacaoSchema),
    mode: "onChange",
    defaultValues: { unidade_educacional: "", servicos: [], informacoes_adicionais: "" },
  });
  useEffect(() => {
    setValue("unidade_educacional", ue?.uuid ?? "", { shouldValidate: true });
  }, [ue?.uuid, setValue]);
  const botaoDesabilitado = !isValid || isSubmitting || isPending || !ue?.uuid;

  function onSubmit(dados: SolicitacaoFormData) {
    setDadosPendentes(dados);
    setConfirmacaoAberta(true);
  }

  function confirmar(enviarParaAprovacao: boolean) {
    if (!dadosPendentes || envioEmAndamento.current) return;
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
            useSolicitacaoEnviadaStore.getState().abrir(resultado.codigo, enviarParaAprovacao);
          }
          tratarResultado(resultado);
        },
        onError: (error) => {
          setConfirmacaoAberta(false);
          tratarErroInesperado(error);
          router.replace("/solicitacao");
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
              <Link href="/solicitacao">Cancelar</Link>
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
            <DadosSolicitacao
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
      <ConfirmarSolicitacaoModal
        aberto={confirmacaoAberta}
        onOpenChange={setConfirmacaoAberta}
        onSalvar={() => confirmar(false)}
        onEnviar={() => confirmar(true)}
        processando={isPending}
      />
    </>
  );
}
