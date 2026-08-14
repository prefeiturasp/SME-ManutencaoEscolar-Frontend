"use client";
import { AlertaErro } from "@/components/shared/AlertaErro/AlertaErro";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { toastErro, toastSucesso } from "@/components/ui/toast-custom";
import { FormServico } from "@/features/servico/components/Servico/FormServico";
import { useEditarServico } from "@/features/servico/hooks/useEditarServico";
import {
  servicoSchema,
  type ServiceFormData,
} from "@/features/servico/schemas/servicoSchema";
import type { Servico } from "@/features/servico/types/servicos.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

type EditarServicoFormProps = Readonly<{
  uuid: string;
  servico: Servico;
}>;

function formatarDataHora(data?: string | null) {
  if (!data) {
    return "Não informado";
  }

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return "Não informado";
  }

  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(dataFormatada);

  const obterParte = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";

  const dia = obterParte("day");
  const mes = obterParte("month");
  const ano = obterParte("year");
  const hora = obterParte("hour");
  const minuto = obterParte("minute");

  return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
}

export function EditarServicoForm({ uuid, servico }: EditarServicoFormProps) {
  const router = useRouter();

  const { mutate: editarServico } = useEditarServico(uuid);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemErroTitulo, setMensagemErroTitulo] = useState("");
  const [erroAberto, setErroAberto] = useState(false);

  const methods = useForm<ServiceFormData>({
    resolver: zodResolver(servicoSchema),
    mode: "onChange",
    defaultValues: {
      nome: servico.nome,
      status: servico.status ? "true" : "false",
    },
  });

  const {
    handleSubmit,
    formState: { isValid, isDirty },
  } = methods;

  function onSubmit(dados: ServiceFormData) {
    editarServico(dados, {
      onSuccess: (resultado) => {
        if (!resultado.success) {
          if (resultado.status === 400) {
            setMensagemErroTitulo(resultado.title);
            setMensagemErro(resultado.message);
            setErroAberto(true);

            return;
          }

          toastErro({
            titulo: resultado.title,
            descricao: resultado.message,
          });
          router.replace("/cadastro/servicos");

          return;
        }

        toastSucesso({
          titulo: "Sucesso!",
          descricao: "As alterações foram salvas.",
        });

        router.replace("/cadastro/servicos");
      },

      onError: (error) => {
        console.error("Erro inesperado ao editar serviço:", error);

        toastErro({
          titulo: "Erro",
          descricao:
            "Não conseguimos salvar as alterações. Por favor, tente novamente.",
        });
      },
    });
  }

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Editar Serviço</h1>

            <div className="flex gap-2">
              <Button
                asChild
                type="button"
                variant="outline"
                size="big-lg"
                className="max-w-[88px]"
              >
                <Link href="/cadastro/servicos">Cancelar</Link>
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="big-lg"
                className="max-w-[157px] border-[var(--trash-color)] border text-[var(--trash-color)]"
              >
                <Trash2 className="text-current" />
                Excluir serviço
              </Button>

              <Button
                type="submit"
                variant="default"
                size="big-lg"
                className="max-w-[72px]"
                disabled={!isValid || !isDirty}
              >
                Salvar
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <CardTitle className="text-sm text-muted-foreground">
              Preencha as informações e clique em “salvar” para armazenar os
              dados.
            </CardTitle>

            <FormServico />

            <div className="font-bold text-xs mt-2 text-gray">
              <p className="">
                INSERIDO por {servico.criado_por_nome ?? "Não informado"} (
                {servico.username}) em {formatarDataHora(servico.criado_em)}
              </p>

              <p className="">
                ALTERADO por {servico.atualizado_por_nome ?? "Não informado"} (
                {servico.username}) em {formatarDataHora(servico.atualizado_em)}
              </p>
            </div>
          </Card>
        </form>
      </FormProvider>

      <AlertaErro
        aberto={erroAberto}
        titulo={mensagemErroTitulo}
        mensagem={mensagemErro}
        onOpenChange={setErroAberto}
      />
    </div>
  );
}
