"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toastErro, toastSucesso } from "@/components/ui/toast-custom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { obterMensagemErro } from "../../../../utils/erro";
import { useCreateFornecedor } from "../../hooks/useCreateFornecedor";
import {
  fornecedorSchema,
  type FornecedorSchema,
  type FornecedorSchemaOutput,
} from "../../schemas/fornecedor.schema";
import { FornecedorStepper } from "./FornecedorStepper";
import { InformacoesGeraisStep } from "./InformacoesGeraisStep";

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
  "status",
  "cep",
  "logradouro",
  "numero",
  "cidade",
  "estado",
];

const DEFAULT_VALUES: FornecedorSchema = {
  nome: "",
  cnpj: "",
  razao_social: "",
  status: undefined,
  link_rastreio: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  cidade: "",
  estado: "",
};

export function FornecedorForm() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(0);
  const ultimaEtapa = etapa === STEP_FIELDS.length - 1;

  const criarFornecedor = useCreateFornecedor();

  const form = useForm<FornecedorSchema, unknown, FornecedorSchemaOutput>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: DEFAULT_VALUES,
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

      const dadosFornecedor = fornecedorSchema.parse({
        ...form.getValues(),
      });

      criarFornecedor.mutate(dadosFornecedor, {
        onSuccess: () => {
          toastSucesso({
            titulo: "Sucesso",
            descricao: "O fornecedor foi cadastrado.",
          });
          router.replace("/cadastro/empresas");
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
      router.push("/cadastro/empresas");
      return;
    }
    setEtapa((atual) => atual - 1);
  }

  return (
    <FormProvider {...form}>
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Cadastro de empresa</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/cadastro/empresas")}
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
              {ultimaEtapa ? "Cadastrar empresa" : "Próximo"}
            </Button>
          </div>
        </div>

        <FornecedorStepper currentStep={etapa} />
        <Card className="p-6">
          <CardContent className="p-0">
            {etapa === 0 && <InformacoesGeraisStep />}
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}
