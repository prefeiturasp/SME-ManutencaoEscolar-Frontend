"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";

import { FormSelectField } from "@/components/form";
import { FormComboboxField } from "@/components/form/FormComboboxField";
import type { Opcao } from "@/components/types/opcao.types";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { FuncaoProfissionalResumo } from "@/features/profissional/types/profissional.types";
import {
  ProfissionalEquipeSchema,
  type EquipeFormData,
  type ProfissionalEquipeFormData,
} from "../schema/equipeSchema";

type ProfissionaisEquipeProps = {
  profissionaisOpcoes: Opcao[];
  profissionais: {
    uuid: string;
    funcoes: FuncaoProfissionalResumo[];
  }[];
};

function obterDadosProfissional(uuid: string, opcoes: Opcao[]) {
  const label = opcoes.find((opcao) => opcao.value === uuid)?.label;

  if (!label) {
    return { nome: "Profissional indisponível", cpf: "—" };
  }

  const separador = label.indexOf(" - ");

  if (separador === -1) {
    return { nome: label, cpf: "—" };
  }

  return {
    cpf: label.slice(0, separador),
    nome: label.slice(separador + 3),
  };
}

export function ProfissionaisEquipe({
  profissionaisOpcoes,
  profissionais,
}: Readonly<ProfissionaisEquipeProps>) {
  const { control } = useFormContext<EquipeFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "profissionais",
  });

  const profissionaisAdicionados = new Set(fields.map((item) => item.profissional));
  const profissionaisDisponiveis = profissionaisOpcoes.filter(
    (opcao) => !profissionaisAdicionados.has(opcao.value),
  );

  const selecaoMethods = useForm<ProfissionalEquipeFormData>({
    resolver: zodResolver(ProfissionalEquipeSchema),
    mode: "onChange",
    defaultValues: {
      profissional: "",
      funcao: "",
    },
  });

  const profissionalSelecionado = useWatch({
    control: selecaoMethods.control,
    name: "profissional",
  });

  const profissionalAtual = profissionais.find(
    (profissional) => profissional.uuid === profissionalSelecionado,
  );

  const funcoesOpcoes: Opcao[] = (profissionalAtual?.funcoes ?? []).map((funcao) => ({
    value: funcao.uuid,
    label: funcao.nome,
  }));

  function adicionarProfissional(dados: ProfissionalEquipeFormData) {
    const jaAdicionado = fields.some((item) => item.profissional === dados.profissional);

    if (jaAdicionado) {
      selecaoMethods.setError("profissional", {
        type: "manual",
        message: "Este profissional já foi adicionado.",
      });
      return;
    }

    append(dados, { shouldFocus: false });
    selecaoMethods.reset();
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-bold text-gray">Informações dos profissionais</h2>

        <p className="text-xs text-gray">
          Preencha os dados dos profissionais que farão parte da equipe.
        </p>
      </div>

      <Card className="gap-4 p-5">
        <CardTitle className="text-base font-bold text-gray">Profissional</CardTitle>

        <FormProvider {...selecaoMethods}>
          <div
            className="
              grid grid-cols-1 items-start gap-4
              md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]
            "
          >
            <FormComboboxField<ProfissionalEquipeFormData>
              name="profissional"
              label="Profissional"
              placeholder="Selecione o profissional"
              tooltip="Apenas profissionais com situação de cadastro “ativo” serão exibidos."
              searchPlaceholder="Pesquisar..."
              emptyMessage="Nenhum profissional encontrado."
              helperText="Busque pelo nome, CPF ou RG."
              options={profissionaisDisponiveis}
              onValueChange={() => {
                selecaoMethods.setValue("funcao", "", {
                  shouldDirty: true,
                  shouldValidate: false,
                });
                selecaoMethods.clearErrors("funcao");
              }}
            />

            <FormSelectField<ProfissionalEquipeFormData>
              name="funcao"
              label="Função"
              placeholder="Selecione"
              options={funcoesOpcoes}
            />

            <div className="md:pt-[18px]">
              <Button
                type="button"
                variant="outline"
                onClick={selecaoMethods.handleSubmit(adicionarProfissional)}
                className="h-10 gap-2"
              >
                <Plus className="size-6" aria-hidden="true" />
                Adicionar
              </Button>
            </div>
          </div>
        </FormProvider>

        {fields.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray">
              <thead className="bg-white-smoke text-xs">
                <tr>
                  <th scope="col" className="px-3 py-3">
                    Nome
                  </th>
                  <th scope="col" className="px-3 py-3">
                    CPF
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Função
                  </th>
                  <th scope="col" className="px-3 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {fields.map((field, index) => {
                  const profissional = obterDadosProfissional(
                    field.profissional,
                    profissionaisOpcoes,
                  );
                  const funcao = profissionais
                    .find((item) => item.uuid === field.profissional)
                    ?.funcoes.find((item) => item.uuid === field.funcao);

                  return (
                    <tr key={field.id} className="odd:bg-white even:bg-white-smoke">
                      <td className="px-3 py-3">{profissional.nome}</td>
                      <td className="whitespace-nowrap px-3 py-3">{profissional.cpf}</td>
                      <td className="px-3 py-3">{funcao?.nome || "—"}</td>
                      <td className="px-3 py-3 text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              aria-label={`Remover ${profissional.nome}`}
                              className="
                            inline-flex size-8 cursor-pointer
                            items-center justify-center rounded-md
                            border border-red-500 text-red-500
                            hover:bg-red-50
                          "
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center">
                            Excluir profissional
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}
