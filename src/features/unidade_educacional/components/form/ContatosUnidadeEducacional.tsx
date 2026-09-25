"use client";

import { FormMaskedField, FormTextField } from "@/components/form";
import { FormComboboxField } from "@/components/form/FormComboboxField";
import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTodosCargosEol } from "@/features/cargo_eol/hooks/useCargoEol";
import { RESPONSAVEL_UNIDADE_EDUCACIONAL_VAZIO } from "@/features/unidade_educacional/schemas/responsavelUnidadeEducacional.schema";
import type { UnidadeEducacionalSchema } from "@/features/unidade_educacional/schemas/unidadesEducacionais.schema";
import { cn } from "@/lib/utils";
import { maskTelefone, unmaskTelefone } from "@/utils/formatadores";
import { Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

interface ContatosUnidadeEducacionalProps {
  readonly "data-testid"?: string;
}

export function ContatosUnidadeEducacional({
  "data-testid": testId,
}: ContatosUnidadeEducacionalProps) {
  const { control, setValue } = useFormContext<UnidadeEducacionalSchema>();

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

  function removerContato(index: number) {
    if (index === 0) {
      setValue("responsaveis.0", {
        ...RESPONSAVEL_UNIDADE_EDUCACIONAL_VAZIO,
        criado_pelo_sincronizador: false,
      });

      return;
    }

    remove(index);
  }

  return (
    <div className="space-y-4" data-testid={testId}>
      <div className="flex w-full flex-col gap-2 pt-4 pb-0">
        <h2 className="text-[20px] font-bold leading-[100%]">
          Informações dos contatos responsáveis
        </h2>

        <p className="text-[14px] font-normal leading-[100%]">
          Dados de identificação de uma ou mais pessoas responsáveis pela Unidade Educacional.
        </p>
      </div>

      {fields.map((field, index) => {
        const obtidoPeloSincronizador = field.criado_pelo_sincronizador;

        return (
          <Card key={field.id} className="p-6">
            <CardContent className="p-0">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray">Contato {index + 1}</h3>
                <Button
                  type="button"
                  variant="destructive"
                  className={cn(
                    "gap-2 rounded-md border border-destructive",
                    "disabled:border-blocked-foreground  disabled:text-blocked-foreground",
                  )}
                  onClick={() => removerContato(index)}
                  disabled={obtidoPeloSincronizador}
                >
                  <Trash2 className="h-[18px] w-4" />
                  <span className="text-[14px] font-bold">Remover contato</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormTextField<UnidadeEducacionalSchema>
                  name={`responsaveis.${index}.registro_funcional`}
                  label="RF ou CPF"
                  placeholder="Exemplo: 1234567"
                  disabled={obtidoPeloSincronizador}
                />

                <FormTextField<UnidadeEducacionalSchema>
                  name={`responsaveis.${index}.nome`}
                  label="Nome completo"
                  placeholder="Exemplo: João da Silva"
                  disabled={obtidoPeloSincronizador}
                />

                <FormComboboxField<UnidadeEducacionalSchema>
                  name={`responsaveis.${index}.cargo`}
                  label="Cargo"
                  options={cargoOptions}
                  placeholder="Selecione"
                  searchPlaceholder="Pesquisar cargo..."
                  emptyMessage="Nenhum cargo encontrado."
                  disabled={obtidoPeloSincronizador}
                />

                <FormTextField<UnidadeEducacionalSchema>
                  name={`responsaveis.${index}.email`}
                  label="E-mail"
                  placeholder="nome.sobrenome@educacao.prefeitura.sp.gov.br"
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
        );
      })}

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
