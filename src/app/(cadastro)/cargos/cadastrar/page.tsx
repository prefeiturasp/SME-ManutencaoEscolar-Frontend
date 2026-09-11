"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { AlertaErro } from "@/components/shared/AlertaErro/AlertaErro";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { FormCargo } from "@/features/cargo/components/FormCargo";
import { useCriarCargo } from "@/features/cargo/hooks/useCriarCargo";
import {
  cargoSchema,
  type CargoFormData,
} from "@/features/cargo/schemas/cargoSchema";

import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";
import { toastErro, toastSucesso } from "@/components/ui/toast-custom";

export default function CadastrarCargoPage() {
  const methods = useForm<CargoFormData>({
    resolver: zodResolver(cargoSchema),
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

  const { mutate, isPending } = useCriarCargo();

  const [erroAberto, setErroAberto] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemErroTitulo, setMensagemErroTitulo] = useState("");

  const router = useRouter();
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

    mutate(payload, {
      onSuccess: (resultado) => {
        if (resultado.success) {
          toastSucesso({
            titulo: "Sucesso!",
            descricao: "O cargo foi cadastrado.",
          });

          return;
        }

        if (resultado.status === 400) {
          setMensagemErro(resultado.message);
          setMensagemErroTitulo(resultado.title);
          setErroAberto(true);

          return;
        }

        toastErro({
          titulo: resultado.title ?? "Erro",
          descricao:
            resultado.message ??
            "Não conseguimos cadastrar o cargo. Por favor, tente novamente.",
        });

        if (resultado.status === 500) {
          router.replace("/cargos");
        }
      },

      onError: (error) => {
        console.error("Erro inesperado ao cadastrar cargo:", error);

        toastErro({
          titulo: "Erro",
          descricao:
            "Não conseguimos cadastrar o cargo. Por favor, tente novamente.",
        });
      },
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
              Preencha as informações e clique em “cadastrar cargo” para
              armazenar os dados.
            </CardTitle>

            <FormCargo />
          </Card>
        </form>
      </FormProvider>

      <AlertaErro
        aberto={erroAberto}
        titulo={mensagemErroTitulo}
        mensagem={mensagemErro}
        onOpenChange={setErroAberto}
      />
    </>
  );
}
