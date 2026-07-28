"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toastErro, toastSucesso } from "@/components/ui/toast-custom";
import { useCreateFornecedor } from "../hooks/useCreateFornecedor";
import {
  fornecedorSchema,
  type FornecedorSchema,
} from "../schemas/fornecedor.schema";
import { FornecedorStepper } from "./FornecedorStepper";
import { InformacoesGeraisStep } from "./InformacoesGeraisStep";
import { obterMensagemErro } from "../../../utils/erro";

const STEP_FIELDS: (keyof FornecedorSchema)[][] = [
  [
    "nome",
    "cnpj",
    "razao_social",
    "status",
    "link_rastreio",
    "cep",
    "logradouro",
    "numero",
    "complemento",
    "cidade",
    "estado",
  ],
];

const REQUIRED_FIELDS: (keyof FornecedorSchema)[] = [
  "nome",
  "cnpj",
  "razao_social",
  "cep",
  "logradouro",
  "numero",
  "cidade",
  "estado",
];

export function FornecedorForm() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(0);
  const ultimaEtapa = etapa === STEP_FIELDS.length - 1;

  const criarFornecedor = useCreateFornecedor();

  const form = useForm<FornecedorSchema>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      nome: "",
      cnpj: "",
      razao_social: "",
      status: true,
      link_rastreio: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      cidade: "",
      estado: "",
    },
    mode: "onBlur",
  });

  const faltouCampoObrigatorio = form
    .watch(REQUIRED_FIELDS)
    .some((valor: unknown) => {
      if (typeof valor === "string") return valor.trim() === "";
      return valor == null;
    });

  const botaoDesabilitado =
    criarFornecedor.isPending || (ultimaEtapa && faltouCampoObrigatorio);

  async function handleNext() {
    if (ultimaEtapa) {
      const valido = await form.trigger();
      if (!valido) return;
      criarFornecedor.mutate(form.getValues(), {
        onSuccess: () => {
          toastSucesso({
            titulo: "Sucesso",
            descricao: "O fornecedor foi cadastrado.",
          });
          router.replace("/cadastro/fornecedores");
        },
        onError: (error) => {
          const mensagemErro = obterMensagemErro(error);

          toastErro({
            titulo: mensagemErro.titulo,
            descricao: mensagemErro.descricao,
          });
          console.error(
            "Erro inesperado ao cadastrar fornecedor:",
            error instanceof Error ? error.message : error,
          );
        },
      });
      return;
    }

    const valido = await form.trigger(STEP_FIELDS[etapa]);
    if (!valido) return;
    setEtapa((atual) => atual + 1);
  }

  function handlePrevious() {
    if (etapa === 0) {
      router.push("/cadastro/fornecedores");
      return;
    }
    setEtapa((atual) => atual - 1);
  }

  return (
    <FormProvider {...form}>
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-xl font-semibold">Cadastro de fornecedor</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/cadastro/fornecedores")}
            >
              Cancelar
            </Button>
            <Button
              variant={etapa === 0 ? "blocked" : "outline"}
              onClick={handlePrevious}
              disabled={etapa === 0}
            >
              Anterior
            </Button>
            <Button
              variant={botaoDesabilitado ? "blocked" : "default"}
              onClick={handleNext}
              disabled={botaoDesabilitado}
            >
              {ultimaEtapa ? "Cadastrar fornecedor" : "Próximo"}
            </Button>
          </div>
        </div>

        <FornecedorStepper currentStep={etapa} />
        <Card>
          <CardContent className="pb-8">
            {etapa === 0 && <InformacoesGeraisStep />}
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}
