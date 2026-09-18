"use client";

import { FormMaskedField, FormSelectField, FormTextField } from "@/components/form";
import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTodosCargosEol } from "@/features/cargo_eol/hooks/useCargoEol";
import { RESPONSAVEL_UNIDADE_EDUCACIONAL_VAZIO } from "@/features/unidade_educacional/schemas/responsavelUnidadeEducacional.schema";
import type { UnidadeEducacionalSchema } from "@/features/unidade_educacional/schemas/unidadesEducacionais.schema";
import { maskTelefone, unmaskTelefone } from "@/utils/formatadores";
import { Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

export function ContatosUnidadeEducacional() {
  const { control } = useFormContext<UnidadeEducacionalSchema>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "responsaveis",
  });

  const { data: cargosEOL } = useTodosCargosEol();

  const cargoOptions =
    cargosEOL?.map((cargo) => ({
      value: cargo.codigo,
      label: cargo.nome,
    })) ?? [];

    const index = 1
    const field = {id: 1}
  return (
    <div className="space-y-6">
      {/* {fields.map((field, index) => ( */}
        <Card key={field.id} className="p-6">
          <CardContent className="p-0">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray">
                Contato {index + 1}
              </h3>

              <Button
                type="button"
                variant="outline"
                className="text-muted-foreground"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 />
                Remover contato
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormTextField<UnidadeEducacionalSchema>
                name={`responsaveis.${index}.registro_funcional`}
                label="RF ou CPF"
                placeholder="Exemplo: 1234567"
              />

              <FormTextField<UnidadeEducacionalSchema>
                name={`responsaveis.${index}.nome`}
                label="Nome completo"
                placeholder="Exemplo: João da Silva"
              />

              <FormSelectField<UnidadeEducacionalSchema>
                name={`responsaveis.${index}.cargo`}
                label="Cargo"
                options={cargoOptions}
              />

              <FormTextField<UnidadeEducacionalSchema>
                name={`responsaveis.${index}.email`}
                label="E-mail"
                placeholder="exemplo: joao.silva@edu.educacao.gov.br"
              />

              <FormMaskedField<UnidadeEducacionalSchema>
                name={`responsaveis.${index}.telefone`}
                label="Telefone"
                placeholder="(00) 0000-0000"
                mask={maskTelefone}
                unmask={unmaskTelefone}
              />

              <FormMaskedField<UnidadeEducacionalSchema>
                name={`responsaveis.${index}.celular`}
                label="Celular"
                placeholder="(00) 00000-0000"
                mask={maskTelefone}
                unmask={unmaskTelefone}
              />
            </div>
          </CardContent>
        </Card>
      {/* ))} */}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => append(RESPONSAVEL_UNIDADE_EDUCACIONAL_VAZIO)}
        >
          <PlusIcon className="h-4 w-4" />
          Adicionar novo contato
        </Button>
      </div>
    </div>
  );
}