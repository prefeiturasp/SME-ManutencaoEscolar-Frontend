"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toastErro, toastSucesso } from "@/components/ui/toast-custom";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { obterMensagemErro } from "@/utils/erro";
import { useCreateEmpresa } from "@/features/empresa/hooks/useCreateEmpresa";
import { useEmpresa } from "@/features/empresa/hooks/useEmpresa";
import { useUpdateEmpresa } from "@/features/empresa/hooks/useUpdateEmpresa";
import {
  empresaSchema,
  type EmpresaSchema,
  type EmpresaSchemaOutput,
} from "@/features/empresa/schemas/empresa.schema";
import { RESPONSAVEL_TECNICO_VAZIO } from "@/features/empresa/schemas/responsavelTecnico.schema";
import { TIPOS_ENGENHEIRO_RESPONSAVEL_TECNICO } from "@/features/empresa/constants/empresa.constants";
import type { EmpresaFormValues } from "@/features/empresa/types/empresa.types";
import type { ResponsavelTecnicoFormValues } from "@/features/empresa/types/responsavelTecnico.types";
import { EmpresaStepper } from "./EmpresaStepper";
import { EmpresaExclusao } from "./EmpresaExclusao";
import { InformacoesGeraisStep } from "./InformacoesGeraisStep";
import { ResponsavelTecnicoStep } from "./ResponsavelTecnicoStep";
import { formatarDataHora, maskCnpj } from "@/utils/formatadores";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";

const REQUIRED_FIELDS: (keyof EmpresaSchema)[] = [
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

const RESPONSAVEL_TECNICO_REQUIRED_FIELDS = [
  "tipo",
  "nome",
  "telefone",
  "email",
] as const;

const STEP_FIELDS: (keyof EmpresaSchema)[][] = [
  ["link_rastreio", "complemento", ...REQUIRED_FIELDS],
  ["responsaveis_tecnicos"],
];

const DEFAULT_VALUES: EmpresaSchema = {
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
  responsaveis_tecnicos: [RESPONSAVEL_TECNICO_VAZIO],
};

export function EmpresaForm({ uuid }: { readonly uuid?: string }) {
  const router = useRouter();
  const [etapa, setEtapa] = useState(0);
  const ultimaEtapa = etapa === STEP_FIELDS.length - 1;
  const modoEdicao = Boolean(uuid);
  const uuidSeguro = uuid ?? "";

  const {
    data: empresa,
    isLoading: carregandoEmpresa,
    isError,
  } = useEmpresa(uuidSeguro);
  const criarEmpresa = useCreateEmpresa();
  const atualizarEmpresa = useUpdateEmpresa(uuidSeguro);

  const form = useForm<EmpresaSchema, unknown, EmpresaSchemaOutput>({
    resolver: zodResolver(empresaSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onBlur",
  });

  useEffect(() => {
    if (!modoEdicao || !empresa) return;

    form.reset({
      nome: empresa.nome,
      cnpj: empresa.cnpj,
      razao_social: empresa.razao_social,
      status: empresa.status ? "true" : "false",
      link_rastreio: empresa.link_rastreio ?? "",
      cep: empresa.cep,
      logradouro: empresa.logradouro,
      numero: empresa.numero,
      complemento: empresa.complemento ?? "",
      cidade: empresa.cidade,
      estado: empresa.estado,
      responsaveis_tecnicos: [RESPONSAVEL_TECNICO_VAZIO],
    });
  }, [empresa, modoEdicao, form]);

  const faltouCampoEmpresa = form
    .watch(REQUIRED_FIELDS)
    .some((valor: unknown) => {
      if (typeof valor === "string") return valor.trim() === "";
      return valor == null;
    });

  const responsaveisTecnicos = form.watch("responsaveis_tecnicos") ?? [];
  const faltouResponsavelTecnico =
    responsaveisTecnicos.length === 0 ||
    responsaveisTecnicos.some((responsavel) => {
      const ehEngenheiro = TIPOS_ENGENHEIRO_RESPONSAVEL_TECNICO.includes(
        responsavel?.tipo as (typeof TIPOS_ENGENHEIRO_RESPONSAVEL_TECNICO)[number],
      );

      const camposObrigatorios: readonly (keyof ResponsavelTecnicoFormValues)[] =
        ehEngenheiro
          ? [
              ...RESPONSAVEL_TECNICO_REQUIRED_FIELDS,
              "numero_crea",
              "numero_art",
            ]
          : RESPONSAVEL_TECNICO_REQUIRED_FIELDS;

      const faltouCampoObrigatorio = camposObrigatorios.some((campo) => {
        const valor = responsavel?.[campo];
        return typeof valor !== "string" || valor.trim() === "";
      });

      if (faltouCampoObrigatorio) return true;

      if (!ehEngenheiro) return false;
    });

  const salvando = modoEdicao
    ? atualizarEmpresa.isPending
    : criarEmpresa.isPending;

  const botaoDesabilitado =
    carregandoEmpresa ||
    salvando ||
    faltouCampoEmpresa ||
    (ultimaEtapa && faltouResponsavelTecnico);

  async function salvar() {
    const valido = await form.trigger();
    if (!valido) return;

    const dados = empresaSchema.parse(form.getValues());
    const payload: EmpresaFormValues = {
      ...dados,
      responsaveis_tecnicos: dados.responsaveis_tecnicos.map(
        ({ anexos: _anexos, ...resto }) => resto,
      ),
    };
    const mutation = modoEdicao ? atualizarEmpresa : criarEmpresa;

    mutation.mutate(payload, {
      onSuccess: (resultado) => {
        if (!resultado.success) {
          toastErro({
            titulo: resultado.title,
            descricao: resultado.message,
          });
          return;
        }

        toastSucesso({
          titulo: "Sucesso",
          descricao: modoEdicao
            ? `Alteração de empresa com CNPJ ${maskCnpj(dados.cnpj)} realizada com sucesso.`
            : `A empresa com CNPJ ${maskCnpj(dados.cnpj)} foi cadastrada.`,
        });
        router.replace("/empresas");
      },
      onError: (error) => {
        const mensagemErro = obterMensagemErro(error);

        toastErro({
          titulo: mensagemErro.titulo,
          descricao: mensagemErro.descricao,
        });
        console.error(
          modoEdicao
            ? "Erro inesperado ao atualizar empresa:"
            : "Erro inesperado ao cadastrar empresa:",
          error instanceof Error ? error.message : error,
        );
      },
    });
  }

  async function handleNext() {
    if (ultimaEtapa) {
      await salvar();
      return;
    }

    const valido = await form.trigger(STEP_FIELDS[etapa]);
    if (!valido) return;
    setEtapa((atual) => atual + 1);
  }

  function handlePrevious() {
    if (etapa === 0) {
      router.push("/empresas");
      return;
    }
    setEtapa((atual) => atual - 1);
  }

  let textoBotaoPrincipal = "Próximo";
  if (ultimaEtapa) {
    textoBotaoPrincipal = modoEdicao
      ? "Salvar alterações"
      : "Cadastrar empresa";
  }

  return (
    <>
      {modoEdicao && (isError || !empresa) && !carregandoEmpresa && (
        <div className="flex min-h-[70vh] items-center justify-center">
          <ListaVazio
            titulo="Esta informação não está mais disponível!"
            descricao={
              "Este item não existe ou foi excluído por outro usuário e não pode mais ser editado.\nAtualize a página para exibir as informações mais recentes."
            }
            textoBotao="Atualizar página"
            href="/empresas"
            primary
            icone={RotateCw}
          />
        </div>
      )}
      {modoEdicao && carregandoEmpresa && <LoadingGlobal exibir />}
      {!isError && !carregandoEmpresa && (
        <FormProvider {...form}>
          <div className="mx-auto w-full">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">
                {modoEdicao ? "Edição de empresa" : "Cadastro de empresa"}
              </h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/empresas")}
                >
                  Cancelar
                </Button>
                {modoEdicao && (
                  <EmpresaExclusao
                    uuid={uuidSeguro}
                    cnpj={empresa?.cnpj ?? ""}
                  />
                )}
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
                  {textoBotaoPrincipal}
                </Button>
              </div>
            </div>

            <EmpresaStepper
              currentStep={etapa}
              campos_preenchidos={[
                !faltouCampoEmpresa,
                !faltouResponsavelTecnico,
              ]}
            />

            {etapa === 0 && (
              <Card className="p-6">
                <CardContent className="p-0">
                  <InformacoesGeraisStep />

                  {modoEdicao && empresa && (
                    <div className="mt-8 flex flex-col items-start font-bold text-gray text-[12px]">
                      <p>
                        Inserido por {empresa.criado_por ?? "Não informado"} em{" "}
                        {formatarDataHora(empresa.criado_em)}
                      </p>
                      <p>
                        Alterado por {empresa.atualizado_por ?? "Não informado"}{" "}
                        em {formatarDataHora(empresa.atualizado_em)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {etapa === 1 && <ResponsavelTecnicoStep />}
          </div>
        </FormProvider>
      )}
    </>
  );
}
