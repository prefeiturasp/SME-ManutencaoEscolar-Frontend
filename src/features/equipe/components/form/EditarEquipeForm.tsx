"use client";

import { EquipeFormConteudo } from "@/features/equipe/components/form/EquipeFormConteudo";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { AlertaErroVinculoEquipe } from "@/features/equipe/components/form/AlertaErroVinculoEquipe";
import { useEditarEquipe } from "@/features/equipe/hooks/useEditarEquipe";
import { EquipeSchema, type EquipeFormData } from "@/features/equipe/schema/equipeSchema";
import type {
  EquipeDetalhe,
  ProfissionalVinculadoEquipe,
} from "@/features/equipe/types/equipe.types";
import { useFeedbackEntidade } from "@/hooks/useFeedbackEntidade";

type EditarEquipeFormProps = Readonly<{ uuid: string; equipe: EquipeDetalhe }>;

export function EditarEquipeForm({ uuid, equipe }: EditarEquipeFormProps) {
  const { mutate, isPending } = useEditarEquipe(uuid);
  const methods = useForm<EquipeFormData>({
    resolver: zodResolver(EquipeSchema),
    mode: "onChange",
    defaultValues: {
      nome: equipe.nome,
      situacao: equipe.situacao ? "true" : "false",
      empresa: equipe.empresa,
      lote: equipe.lote,
      profissionais: equipe.profissionais,
    },
  });

  const {
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting },
  } = methods;

  const botaoDesabilitado = !isValid || !isDirty || isSubmitting || isPending;

  const { tratarResultado, tratarErroInesperado, alertaProps } =
    useFeedbackEntidade<ProfissionalVinculadoEquipe>({
      mensagemSucesso: "As alterações foram salvas.",
      contextoErro: "editar equipe",
      rotaRetorno: "/empresas/equipes/",
    });

  function onSubmit(dados: EquipeFormData) {
    mutate(dados, {
      onSuccess: tratarResultado,
      onError: tratarErroInesperado,
    });
  }

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Edição de equipe</h1>

            <div className="flex gap-2">
              <Link href="/empresas/equipes" className="flex items-center gap-2">
                <Button type="button" variant="outline" size="big-lg" className="max-w-[88px]">
                  Cancelar
                </Button>
              </Link>

              <Button
                type="submit"
                variant={botaoDesabilitado ? "blocked" : "default"}
                size="big-md"
                disabled={botaoDesabilitado}
              >
                Salvar
              </Button>
            </div>
          </div>

          <EquipeFormConteudo equipe={equipe} />
        </form>
      </FormProvider>

      <AlertaErroVinculoEquipe
        aberto={alertaProps.aberto}
        titulo={alertaProps.titulo}
        mensagem={alertaProps.mensagem}
        vinculados={alertaProps.vinculados}
        onOpenChange={alertaProps.onOpenChange}
      />
    </>
  );
}
