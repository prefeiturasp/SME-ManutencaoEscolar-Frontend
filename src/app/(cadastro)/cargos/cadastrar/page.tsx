"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";

import { AlertaErro } from "@/components/shared/AlertaErro/AlertaErro";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { FormCargo } from "@/features/cargo/components/FormCargo";
import { useCriarCargo } from "@/features/cargo/hooks/useCriarCargo";
import { CargoSchema, type CargoFormData } from "@/features/cargo/schemas/CargoSchema";

import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";
import { useFeedbackEntidade } from "@/hooks/useFeedbackEntidade";

export default function CadastrarCargoPage() {
  const methods = useForm<CargoFormData>({
    resolver: zodResolver(CargoSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      exige_documento: undefined,
      novo_documento: "",
      documentos: [],
    },
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = methods;

  const { mutate: criarCargo, isPending } = useCriarCargo();

  const { tratarResultado, tratarErroInesperado, alertaProps } = useFeedbackEntidade({
    mensagemSucesso: "O cargo foi cadastrado.",
    contextoErro: "criar cargo",
    rotaRetorno: "/cargos",
  });

  function onSubmit(dados: CargoFormData) {
    const { novo_documento: novoDocumento, ...dadosCargo } = dados;

    const documentos = [
      ...(dados.documentos ?? []),
      ...(novoDocumento?.trim()
        ? [
            {
              nome: novoDocumento.trim(),
            },
          ]
        : []),
    ];

    const payload = {
      ...dadosCargo,
      documentos,
    };

    criarCargo(payload, {
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
            <h1 className="text-xl font-semibold">Cadastro de Cargo</h1>

            <div className="flex gap-2">
              <Button
                asChild
                type="button"
                variant="outline"
                size="big-lg"
                className="max-w-[88px]"
              >
                <Link href="/cargos">Cancelar</Link>
              </Button>

              <Button
                type="submit"
                variant="default"
                size="big-md"
                disabled={!isValid || isSubmitting || isPending}
              >
                Cadastrar cargo
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <CardTitle className="text-sm text-muted-foreground">
              Preencha as informações e clique em “cadastrar cargo” para armazenar os dados.
            </CardTitle>

            <FormCargo />
          </Card>
        </form>
      </FormProvider>

      <AlertaErro
        aberto={alertaProps.aberto}
        titulo={alertaProps.titulo}
        mensagem={alertaProps.mensagem}
        onOpenChange={alertaProps.onOpenChange}
      />
    </>
  );
}
