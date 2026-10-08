"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";
import type { Opcao } from "@/components/types/opcao.types";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useEmpresas } from "@/features/empresa/hooks/useEmpresas";
import { AlertaErroVinculoEquipe } from "@/features/equipe/components/form/AlertaErroVinculoEquipe";
import { FormEquipe } from "@/features/equipe/components/form/EquipeForm";
import { ProfissionaisEquipe } from "@/features/equipe/components/form/ProfissionaisEquipeForm";
import { useCriarEquipe } from "@/features/equipe/hooks/useCriarEquipe";
import { EquipeSchema, type EquipeFormData } from "@/features/equipe/schema/equipeSchema";
import type { ProfissionalVinculadoEquipe } from "@/features/equipe/types/equipe.types";
import { useLotes } from "@/features/lotes/hooks/useLotes";
import { useTodosProfissionais } from "@/features/profissional/hooks/useProfissionais";
import { useFeedbackEntidade } from "@/hooks/useFeedbackEntidade";
import { calcularDiasParaVencimento } from "@/utils/vencimentoLote";

function formatarPeriodoLote(data?: string | null): string {
  if (!data) return "—";

  return data.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3/$2/$1");
}

export default function CadastrarEquipePage() {
  const { mutate, isPending } = useCriarEquipe();
  const [mostrarProfissionais, setMostrarProfissionais] = useState(false);
  const { data: profissionaisData } = useTodosProfissionais();
  const { data: respostaEmpresas } = useEmpresas({
    page_size: "all",
  });

  const profissionaisAtivos = (profissionaisData?.results ?? []).filter(
    (profissional) => profissional.status === true,
  );

  const profissionaisOpcoes: Opcao[] = profissionaisAtivos.map((profissional) => ({
    value: profissional.uuid,
    label: `${profissional.cpf} - ${profissional.nome}`,
  }));

  const EmpreasasAtivos = (respostaEmpresas?.results ?? []).filter(
    (empresa) => empresa.status === true,
  );

  const EmpreasasOpcoes: Opcao[] = EmpreasasAtivos.map((empresa) => ({
    value: empresa.uuid,
    label: `${empresa.cnpj} - ${empresa.nome}`,
  }));

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
    control,
    getValues,
    setValue,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = methods;

  const empresaSelecionada = useWatch({ control, name: "empresa" });
  const empresaId = respostaEmpresas?.results.find(
    (empresa) => empresa.uuid === empresaSelecionada,
  )?.id;

  const { data: respostaLotes } = useLotes(
    { page: 1, page_size: "all", empresa: empresaId },
    { enabled: empresaId !== undefined, keepPreviousData: false },
  );

  const lotesOpcoes: Opcao[] =
    empresaId === undefined
      ? []
      : (respostaLotes?.results ?? [])
          .filter((lote) => {
            const diasParaVencimento = calcularDiasParaVencimento(lote.periodo_final);

            return Boolean(lote.uuid) && diasParaVencimento !== null && diasParaVencimento >= 0;
          })
          .map((lote) => ({
            value: lote.uuid!,
            label: `${lote.nome || lote.codigo_cadastro} - ${formatarPeriodoLote(lote.periodo_inicial)} à ${formatarPeriodoLote(lote.periodo_final)}`,
          }));

  useEffect(() => {
    if (getValues("lote")) {
      setValue("lote", "", { shouldDirty: true, shouldValidate: true });
    }
  }, [empresaSelecionada, getValues, setValue]);

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
      <CadastroBreadcrumb />

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
                variant="default"
                size="big-md"
                disabled={!isValid || isSubmitting || isPending}
              >
                Cadastrar equipe
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <CardTitle className="text-xl font-bold text-gray">Informações da equipe</CardTitle>

            <p className="text-sm text-[var(--gray)]">
              Preencha os dados da equipe e, em seguida, adicione os profissionais que farão parte
              dela.
            </p>

            <FormEquipe empresasOpcoes={EmpreasasOpcoes} lotesOpcoes={lotesOpcoes} />

            {!mostrarProfissionais && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMostrarProfissionais(true)}
                >
                  + Adicionar profissionais
                </Button>
              </div>
            )}
          </Card>

          {mostrarProfissionais && (
            <ProfissionaisEquipe
              profissionaisOpcoes={profissionaisOpcoes}
              profissionais={profissionaisAtivos}
            />
          )}
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
