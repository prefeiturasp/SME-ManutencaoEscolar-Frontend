"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { InfoIcon, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/icons/plus";
import {
  TIPO_RESPONSAVEL_TECNICO_OPCOES,
  TIPOS_ENGENHEIRO_RESPONSAVEL_TECNICO,
} from "@/features/empresa/constants/empresa.constants";
import { maskTelefone, unmaskTelefone } from "@/utils/formatadores";
import type { EmpresaSchema } from "@/features/empresa/schemas/empresa.schema";
import { RESPONSAVEL_TECNICO_VAZIO } from "@/features/empresa/schemas/responsavelTecnico.schema";
import {
  FormSection,
  FormTextField,
  FormSelectField,
  FormMaskedField,
  FormFileField,
} from "@/components/form";
import { Card, CardContent } from "@/components/ui/card";

export function ResponsavelTecnicoStep() {
  const { control } = useFormContext<EmpresaSchema>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "responsaveis_tecnicos",
  });

  const responsaveis =
    useWatch({ control, name: "responsaveis_tecnicos" }) ?? [];

  return (
    <div className="space-y-8">
      {fields.map((field, index) => {
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
                <div className="grid grid-cols-3 gap-4">
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
                    className="col-span-3"
                  />

                  {tipoEngenheiroSelecionado && (
                    <div className="col-span-3 flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <InfoIcon className="h-5 w-5 shrink-0 text-primary" />

                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-primary">
                          Atenção!
                        </p>
                        <p className="text-sm text-primary">
                          Para os cargos de &ldquo;engenheiro civil&rdquo; e
                          &ldquo;engenheiro elétrico&rdquo; é necessário inserir
                          ao menos um documento comprobatório no campo de
                          anexos.
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

      <div className="flex justify-end">
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
