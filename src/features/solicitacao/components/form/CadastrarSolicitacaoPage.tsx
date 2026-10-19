"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormError } from "@/components/form/FormError";
import { Button } from "@/components/ui/button";
import {
  solicitacaoSchema,
  type SolicitacaoFormData,
} from "@/features/solicitacao/schemas/solicitacaoSchema";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { DadosSolicitacao } from "./DadosSolicitacao";
import { InformacoesAdicionais } from "./InformacoesAdicionais";
import { InformacoesUE } from "./InformacoesUE";
import { ServicosManutencao } from "./ServicosManutencao";

export default function CadastrarSolicitacaoPage() {
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
    defaultValues: { unidadeEducacional: "", servicos: [], informacoesAdicionais: "" },
  });
  useEffect(() => {
    setValue("unidadeEducacional", ue?.uuid ?? "", { shouldValidate: true });
  }, [ue?.uuid, setValue]);
  const botaoDesabilitado = !isValid || isSubmitting || !ue?.uuid;

  function onSubmit(dados: SolicitacaoFormData) {
    const { informacoesAdicionais, unidadeEducacional, tipoAtendimento } = dados;
    const payload = {
      informacoes_adicionais: informacoesAdicionais,
      tipo_atendimento: tipoAtendimento,
      unidade_educacional: unidadeEducacional,
      servicos: dados.servicos.map((servico) => ({
        ...(servico.servico === "outros"
          ? { servico_especifico: servico.servico_especifico }
          : { servico: servico.servico }),
        local_repero: servico.local,
        descricao: servico.descricao,
        arquivos: servico.arquivos,
      })),
    };

    console.log("Dados da solicitação:", payload);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nova solicitação</h1>

        <div className="flex gap-2">
          <Button asChild type="button" variant="outline" size="big-lg" className="max-w-[88px]">
            <Link href="/solicitacao">Cancelar</Link>
          </Button>

          <Button
            type="submit"
            size="big-md"
            disabled={botaoDesabilitado}
            variant={botaoDesabilitado ? "blocked" : "default"}
          >
            Salvar
          </Button>
        </div>
      </div>
      <InformacoesUE dados={informacoesUE} className="mt-6" />
      {!ue?.uuid && (
        <FormError message="O usuário logado precisa ter uma unidade educacional vinculada." />
      )}
      <Controller
        name="tipoAtendimento"
        control={control}
        render={({ field, fieldState }) => (
          <DadosSolicitacao
            valor={field.value ?? ""}
            onChange={field.onChange}
            onBlur={() => {
              field.onBlur();
              void trigger("tipoAtendimento");
            }}
            erro={fieldState.isTouched ? fieldState.error?.message : undefined}
          />
        )}
      />
      <Controller
        name="servicos"
        control={control}
        render={({ field }) => <ServicosManutencao valor={field.value} onChange={field.onChange} />}
      />
      {errors.servicos?.message && <FormError message={errors.servicos.message} />}
      <Controller
        name="informacoesAdicionais"
        control={control}
        render={({ field }) => (
          <InformacoesAdicionais valor={field.value ?? ""} onChange={field.onChange} />
        )}
      />
    </form>
  );
}
