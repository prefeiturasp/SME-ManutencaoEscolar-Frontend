"use client";

import { FormError } from "@/components/form/FormError";
import { ConfirmDialog } from "@/components/ui/confirmaDialogo";
import { Label } from "@/components/ui/label";
import { toastSucesso } from "@/components/ui/toast-custom";
import { useEnviarSolicitacaoGmeSme } from "@/features/solicitacao_manutencao/hooks/useEnviarSolicitacaoGmeSme";
import {
  enviarSolicitacaoGmeSmeSchema,
  type EnviarSolicitacaoGmeSmeFormData,
} from "@/features/solicitacao_manutencao/schemas/analiseDreSchema";
import type { DecisaoDre } from "@/features/solicitacao_manutencao/types/analiseDre.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";

export function EnviarSolicitacaoGmeSmeModal({
  uuid,
  decisao,
  dataAlteracao,
  onFechar,
}: Readonly<{ uuid: string; decisao: DecisaoDre; dataAlteracao: string; onFechar: () => void }>) {
  const id = useId();
  const router = useRouter();
  const { mutateAsync: enviarSolicitacao, isPending } = useEnviarSolicitacaoGmeSme();
  const envioEmAndamento = useRef(false);
  const {
    register,
    handleSubmit,
    trigger,
    formState: { isValid, isSubmitting, errors },
  } = useForm<EnviarSolicitacaoGmeSmeFormData>({
    resolver: zodResolver(enviarSolicitacaoGmeSmeSchema),
    mode: "onChange",
    defaultValues: { observacoes: "" },
  });
  const [erro, setErro] = useState("");

  async function enviar(dados: EnviarSolicitacaoGmeSmeFormData) {
    if (envioEmAndamento.current) return;
    envioEmAndamento.current = true;
    setErro("");
    try {
      const resultado = await enviarSolicitacao({
        uuid,
        decisao,
        observacoes: dados.observacoes,
        data_alteracao: dataAlteracao,
      });
      if (!resultado.success) {
        setErro(resultado.message || resultado.title);
        return;
      }
      toastSucesso({
        titulo: "Sucesso!",
        descricao: resultado.data.detail,
      });
      router.push("/solicitacao_manutencao");
      onFechar();
    } catch {
      setErro("Não foi possível enviar a solicitação. Tente novamente.");
    } finally {
      envioEmAndamento.current = false;
    }
  }

  return (
    <ConfirmDialog
      open
      size="md"
      title="Enviar solicitação para GME/SME"
      cancelLabel="Voltar e revisar"
      confirmLabel="Enviar para GME/SME"
      confirmDisabled={!isValid || isSubmitting || isPending}
      loading={isPending || isSubmitting}
      loadingLabel="Enviando..."
      closeOnConfirm={false}
      onOpenChange={(aberto) => {
        if (!aberto && !envioEmAndamento.current) onFechar();
      }}
      onConfirm={() => handleSubmit(enviar)()}
      description={
        <>
          <p className="leading-5">
            Adicione um comentário no campo “observações” e confirme o envio da solicitação para
            aprovação da GME/SME. Após o envio, as informações não poderão mais ser editadas.
          </p>
          <div className="mt-4 space-y-1">
            <Label htmlFor={`${id}-observacoes`} className="text-sm font-semibold">
              Observações
            </Label>
            <textarea
              id={`${id}-observacoes`}
              {...register("observacoes", {
                onChange: () => setErro(""),
                onBlur: () => {
                  void trigger("observacoes");
                },
              })}
              placeholder="Digite as considerações..."
              disabled={isPending || isSubmitting}
              aria-invalid={Boolean(errors.observacoes)}
              aria-describedby={errors.observacoes ? `${id}-observacoes-erro` : undefined}
              className="min-h-28 w-full resize-y rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
            />
            {errors.observacoes && (
              <div id={`${id}-observacoes-erro`}>
                <FormError message={errors.observacoes.message} />
              </div>
            )}
          </div>
          {erro && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {erro}
            </p>
          )}
        </>
      }
    />
  );
}
