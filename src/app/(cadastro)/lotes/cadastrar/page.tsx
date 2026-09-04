"use client";

import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";
import { AlertaErroVinculoLote } from "@/app/(cadastro)/lotes/components/AlertaErroVinculoLote";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { FormLote } from "@/features/lotes/components/FormLote";
import { useCriarLote } from "@/features/lotes/hooks/useCriarLote";
import { useFeedbackLote } from "@/features/lotes/hooks/useFeedbackLote";
import { useOpcoesLote } from "@/features/lotes/hooks/useOpcoesLote";
import {
  LoteSchema,
  type LoteFormData,
} from "@/features/lotes/schemas/loteSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";

export default function CadastrarLotePage() {
  const methods = useForm<LoteFormData>({
    resolver: zodResolver(LoteSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      status: undefined,
      codigo_cadastro: "",
      empresa: "",
      periodo_inicial: "",
      periodo_final: "",
      diretorias_regionais: [],
    },
  });

  const { empresasOpcoes, diretoriasRegionaisOpcoes } = useOpcoesLote();

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = methods;

  const { tratarResultado, tratarErroInesperado, alertaProps } =
    useFeedbackLote({
      mensagemSucesso: "Lote cadastrado com sucesso.",
      contextoErro: "cadastrar lote",
    });

  const { mutate } = useCriarLote();

  function onSubmit(dados: LoteFormData) {
    mutate(dados, {
      onSuccess: tratarResultado,
      onError: tratarErroInesperado,
    });
  }
  return (
    <>
      <CadastroBreadcrumb />
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Cadastro de lote</h1>

            <div className="flex gap-2">
              <Link href="/lotes/" className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="big-lg"
                  className="max-w-[88px]"
                >
                  Cancelar
                </Button>
              </Link>

              <Button
                type="submit"
                variant="default"
                size="big-xs"
                disabled={!isValid || isSubmitting}
              >
                Cadastrar lote
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <CardTitle className="text-sm text-[var(--gray)]">
              Preencha as informações e clique em “cadastrar lote” para
              armazenar os dados.
            </CardTitle>

            <FormLote
              empresasOpcoes={empresasOpcoes}
              diretoriasRegionaisOpcoes={diretoriasRegionaisOpcoes}
            />
          </Card>
        </form>
      </FormProvider>

      <AlertaErroVinculoLote {...alertaProps} width={672} />
    </>
  );
}
