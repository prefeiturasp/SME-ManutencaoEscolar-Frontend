"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { InfoIcon, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/icons/plus";
import {
  TIPO_RESPONSAVEL_TECNICO_OPCOES,
  TIPOS_ENGENHEIRO_RESPONSAVEL_TECNICO,
} from "@/features/empresa/constants/empresa.constants";
import {
  formatarDataHora,
  maskTelefone,
  unmaskTelefone,
} from "@/utils/formatadores";
import type { EmpresaSchema } from "@/features/empresa/schemas/empresa.schema";
import type { ResponsavelTecnico } from "@/features/empresa/types/responsavelTecnico.types";
import { RESPONSAVEL_TECNICO_VAZIO } from "@/features/empresa/schemas/responsavelTecnico.schema";
import type { Anexo } from "@/features/empresa/types/anexo.type";
import {
  FormSection,
  FormTextField,
  FormSelectField,
  FormMaskedField,
  FormFileField,
} from "@/components/form";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArquivosCard } from "./ArquivosCard";

interface ResponsavelTecnicoStepProps {
  readonly modoEdicao?: boolean;
  readonly ultimoAlterado?: ResponsavelTecnico | null;
}

export function ResponsavelTecnicoStep({
  modoEdicao = false,
  ultimoAlterado,
}: ResponsavelTecnicoStepProps) {
  const { control, setValue } = useFormContext<EmpresaSchema>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "responsaveis_tecnicos",
  });
  const responsaveis =
    useWatch({ control, name: "responsaveis_tecnicos" }) ?? [];

  function removerAnexo(responsavelIndex: number, anexoIndex: number) {
    const anexos = responsaveis[responsavelIndex]?.anexos ?? [];

    setValue(
      `responsaveis_tecnicos.${responsavelIndex}.anexos`,
      anexos.filter((_, index) => index !== anexoIndex),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  return (
    <div className="space-y-8">
      {fields.map((field, index) => {
        const anexosDoResponsavel = responsaveis[index]?.anexos ?? [];
        const arquivos = anexosDoResponsavel.map((anexo, anexoIndex) => ({
          anexo:
            anexo instanceof File
              ? ({ nome: anexo.name } satisfies Anexo)
              : (anexo as Anexo),
          anexoIndex,
        }));

        const tiposUsadosPorOutros = new Set(
          responsaveis
            .filter((_, outroIndex) => outroIndex !== index)
            .map((responsavel) => responsavel?.tipo)
            .filter(Boolean),
        );

        const opcoesTipo = TIPO_RESPONSAVEL_TECNICO_OPCOES.filter(
          (opcao) => !tiposUsadosPorOutros.has(opcao.value),
        );
        const tipoEngenheiroSelecionado =
          TIPOS_ENGENHEIRO_RESPONSAVEL_TECNICO.includes(
            responsaveis[index]
              ?.tipo as (typeof TIPOS_ENGENHEIRO_RESPONSAVEL_TECNICO)[number],
          );

        return (
          <Card key={field.id} className="p-6 my-4">
            <CardContent className="p-0">
              <FormSection
                title={`Dados do responsável técnico ${index + 1}`}
                description="Preencha os dados de identificação e contato da pessoa responsável técnica pela manutenção."
                action={
                  fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="destructive"
                      className="border border-destructive rounded-md"
                      onClick={() => remove(index)}
                      aria-label={`Remover responsável técnico ${index + 1}`}
                    >
                      <Trash2 />
                    </Button>
                  ) : undefined
                }
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormSelectField<EmpresaSchema>
                    name={`responsaveis_tecnicos.${index}.tipo`}
                    label="Tipo"
                    options={opcoesTipo}
                  />

                  <FormTextField<EmpresaSchema>
                    name={`responsaveis_tecnicos.${index}.nome`}
                    label="Nome completo"
                    placeholder="Exemplo: João da Silva"
                  />

                  <FormMaskedField<EmpresaSchema>
                    name={`responsaveis_tecnicos.${index}.telefone`}
                    label="Telefone"
                    placeholder="(00) 00000-0000"
                    mask={maskTelefone}
                    unmask={unmaskTelefone}
                  />

                  <FormTextField<EmpresaSchema>
                    name={`responsaveis_tecnicos.${index}.email`}
                    label="E-mail"
                    placeholder="Exemplo: joao.silva@gmail.com"
                  />

                  <FormTextField<EmpresaSchema>
                    name={`responsaveis_tecnicos.${index}.numero_crea`}
                    label={
                      tipoEngenheiroSelecionado || !responsaveis[index]?.tipo
                        ? "Número do CREA-SP"
                        : "Número do CREA-SP (opcional)"
                    }
                    placeholder="0000000000/A"
                  />

                  <FormTextField<EmpresaSchema>
                    name={`responsaveis_tecnicos.${index}.numero_art`}
                    label={
                      tipoEngenheiroSelecionado || !responsaveis[index]?.tipo
                        ? "Número da ART"
                        : "Número da ART (opcional)"
                    }
                    placeholder="2026/000000-0"
                  />

                  <FormFileField<EmpresaSchema>
                    name={`responsaveis_tecnicos.${index}.anexos`}
                    label={
                      tipoEngenheiroSelecionado || !responsaveis[index]?.tipo
                        ? "Anexos"
                        : "Anexos (opcional)"
                    }
                    className="md:col-span-3"
                    limparAposSelecao
                    helperText="Formatos suportados: pdf, png, jpeg e jpg."
                  />

                  {arquivos.length > 0 && (
                    <div className="space-y-2 md:col-span-3">
                      <ArquivosCard
                        anexos={arquivos.map(({ anexo }) => anexo)}
                        onRemover={(idx) =>
                          removerAnexo(index, arquivos[idx].anexoIndex)
                        }
                      />
                    </div>
                  )}

                  {tipoEngenheiroSelecionado && arquivos.length === 0 && (
                    <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 md:col-span-3">
                      <InfoIcon className="h-5 w-5 shrink-0 text-primary" />

                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-primary">
                          Atenção!
                        </p>
                        <p className="text-sm text-primary">
                          Para os cargos de &ldquo;engenheiro civil&rdquo; e
                          &ldquo;engenheiro eletricista&rdquo; é necessário
                          inserir ao menos um documento comprobatório no campo
                          de anexos.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </FormSection>
            </CardContent>
          </Card>
        );
      })}

      <div
        className={cn(
          "flex items-center gap-4",
          modoEdicao ? "justify-between" : "justify-end",
        )}
      >
        {modoEdicao && ultimoAlterado && (
          <div className="mt-0 flex flex-col items-start font-bold text-gray text-[12px]">
            <p>
              Inserido por {ultimoAlterado.criado_por ?? "Não informado"} em{" "}
              {formatarDataHora(ultimoAlterado.criado_em)}
            </p>
            <p>
              Alterado por {ultimoAlterado.atualizado_por ?? "Não informado"} em{" "}
              {formatarDataHora(ultimoAlterado.atualizado_em)}
            </p>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => append(RESPONSAVEL_TECNICO_VAZIO)}
          disabled={fields.length >= TIPO_RESPONSAVEL_TECNICO_OPCOES.length}
          className={
            fields.length >= TIPO_RESPONSAVEL_TECNICO_OPCOES.length
              ? "border border-blocked-foreground text-blocked-foreground"
              : ""
          }
        >
          <PlusIcon className="h-4 w-4" />
          Adicionar responsável técnico
        </Button>
      </div>
    </div>
  );
}
