"use client";

import { EquipeFormConteudo } from "@/features/equipe/components/form/EquipeFormConteudo";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { AlertaErroVinculoEquipe } from "@/features/equipe/components/form/AlertaErroVinculoEquipe";
import { useCriarEquipe } from "@/features/equipe/hooks/useCriarEquipe";
import { EquipeSchema, type EquipeFormData } from "@/features/equipe/schema/equipeSchema";
import type { ProfissionalVinculadoEquipe } from "@/features/equipe/types/equipe.types";
import { useFeedbackEntidade } from "@/hooks/useFeedbackEntidade";

export function CadastrarEquipeForm() {
  const { mutate, isPending } = useCriarEquipe();
  const methods = useForm<EquipeFormData>({
    resolver: zodResolver(EquipeSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      situacao: undefined,
      empresa: "",
      lote: "",
      profissionais: [],
    },
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = methods;

  const botaoDesabilitado = !isValid || isSubmitting || isPending;

  const { tratarResultado, tratarErroInesperado, alertaProps } =
    useFeedbackEntidade<ProfissionalVinculadoEquipe>({
      mensagemSucesso: "A equipe foi cadastrada.",
      contextoErro: "criar equipe",
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
            <h1 className="text-xl font-semibold">Cadastro de equipe</h1>

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
                Cadastrar equipe
              </Button>
            </div>
          </div>

          <EquipeFormConteudo />
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
