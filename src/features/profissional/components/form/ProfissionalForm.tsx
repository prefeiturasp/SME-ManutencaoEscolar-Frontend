"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";

import { FormFileField, FormMaskedField, FormSelectField, FormTextField } from "@/components/form";
import { FormComboboxField } from "@/components/form/FormComboboxField";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toastErro, toastSucesso } from "@/components/ui/toast-custom";
import { STATUS_OPCOES } from "@/constants/constants";
import { useListarCargos } from "@/features/cargo/hooks/useListarCargo";
import type { Cargo } from "@/features/cargo/types/cargos.types";
import {
  ProfissionalApiError,
  useCreateProfissional,
} from "@/features/profissional/hooks/useCreateProfissional";
import {
  profissionalSchema,
  type ProfissionalSchema,
  type ProfissionalSchemaOutput,
} from "@/features/profissional/schemas/profissional.schema";
import { maskCpf, unmaskCpf } from "@/utils/formatadores";

const FUNCAO_VAZIA = { uuid_cargo: "", documentos: [] };
const DEFAULT_VALUES: ProfissionalSchema = {
  nome: "",
  rg: "",
  cpf: "",
  status: undefined,
  funcoes: [FUNCAO_VAZIA],
};

export function ProfissionalForm() {
  const router = useRouter();
  const criarProfissional = useCreateProfissional();
  const { data: respostaCargos } = useListarCargos({ page_size: "all" });
  const cargos = respostaCargos?.results ?? [];
  const form = useForm<ProfissionalSchema, unknown, ProfissionalSchemaOutput>({
    resolver: zodResolver(profissionalSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onBlur",
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "funcoes" });
  const funcoes = useWatch({ control: form.control, name: "funcoes" });
  const obrigatorios = useWatch({
    control: form.control,
    name: ["nome", "rg", "cpf", "status"],
  });

  const formularioIncompleto =
    obrigatorios.some((valor) => !valor?.trim()) ||
    !funcoes?.length ||
    funcoes.some((funcao) => {
      if (!funcao.uuid_cargo) return true;
      const cargo = cargos.find((item) => item.uuid === funcao.uuid_cargo);
      if (!cargo) return true;
      return Boolean(
        cargo.exige_documento &&
        cargo.documentos.some((_, index) => !funcao.documentos?.[index]?.arquivo?.[0]),
      );
    });

  const opcoesCargo = cargos
    .filter((cargo): cargo is Cargo & { uuid: string } => Boolean(cargo.uuid))
    .map((cargo) => ({
      value: cargo.uuid,
      label: cargo.nome,
    }));

  function cargoDaFuncao(index: number): Cargo | undefined {
    return cargos.find((cargo) => cargo.uuid === funcoes?.[index]?.uuid_cargo);
  }

  function selecionarCargo(index: number, cargoUuid: string) {
    const cargo = cargos.find((item) => item.uuid === cargoUuid);
    form.setValue(
      `funcoes.${index}.documentos`,
      cargo?.exige_documento ? cargo.documentos.map(() => ({ arquivo: [] })) : [],
      { shouldDirty: true, shouldValidate: true },
    );
  }

  const salvar = form.handleSubmit((payload) => {
    if (formularioIncompleto) return;
    criarProfissional.mutate(payload, {
      onSuccess: () => {
        toastSucesso({ titulo: "Sucesso", descricao: "O profissional foi cadastrado." });
        router.replace("/profissionais");
      },
      onError: (erro) => {
        console.error("Erro ao cadastrar profissional:", erro);
        const errosCampos = erro instanceof ProfissionalApiError ? erro.fieldErrors : {};
        (["cpf", "rg"] as const).forEach((campo) => {
          const mensagem = errosCampos[campo];
          if (mensagem) form.setError(campo, { type: "server", message: mensagem });
        });
        toastErro({
          titulo: "Erro",
          descricao: "Não conseguimos cadastrar o profissional. Por favor, tente novamente.",
        });
      },
    });
  });

  return (
    <FormProvider {...form}>
      <div className="mx-auto w-full space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">Cadastro de profissional</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/profissionais")}>
              Cancelar
            </Button>
            <Button
              variant={formularioIncompleto ? "blocked" : "default"}
              disabled={formularioIncompleto || criarProfissional.isPending}
              onClick={() => void salvar()}
            >
              Cadastrar profissional
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <CardContent className="space-y-4 p-0">
            <p className="text-sm text-muted-foreground">
              Preencha as informações e clique em “cadastrar profissional” para armazenar os dados.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormTextField<ProfissionalSchema>
                name="nome"
                label="Nome do profissional"
                placeholder="Digite o nome..."
              />
              <FormTextField<ProfissionalSchema>
                name="rg"
                label="Registro Geral (RG)"
                placeholder="Digite o RG"
                digitsOnly
                maxLength={9}
              />
              <FormMaskedField<ProfissionalSchema>
                name="cpf"
                label="CPF ou CIN"
                placeholder="000.000.000-00"
                mask={maskCpf}
                unmask={unmaskCpf}
              />
              <FormSelectField<ProfissionalSchema>
                name="status"
                label="Status"
                options={STATUS_OPCOES}
              />
            </div>
          </CardContent>
        </Card>

        {fields.map((field, index) => {
          const cargo = cargoDaFuncao(index);
          const funcoesUsadas = new Set(
            funcoes
              ?.filter((_, outroIndex) => outroIndex !== index)
              .map((funcao) => funcao.uuid_cargo),
          );
          const opcoesDisponiveis = opcoesCargo.filter((opcao) => !funcoesUsadas.has(opcao.value));
          return (
            <Card key={field.id} className="p-6">
              <CardContent className="space-y-4 p-0">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Selecione a função que o profissional exerce. Algumas funções exigem o anexo de
                    documentos comprobatórios.
                  </p>
                  {fields.length > 1 && (
                    <Button
                      className="h-9 gap-2 border border-destructive bg-transparent px-4 text-xs"
                      type="button"
                      variant="destructive"
                      aria-label={`Remover função ${index + 1}`}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" /> Excluir
                    </Button>
                  )}
                </div>
                <FormComboboxField<ProfissionalSchema>
                  name={`funcoes.${index}.uuid_cargo`}
                  label="Função"
                  placeholder="Selecione"
                  searchPlaceholder="Digite o nome de uma função..."
                  emptyMessage="Nenhuma função encontrada."
                  options={opcoesDisponiveis}
                  onValueChange={(valor) => selecionarCargo(index, valor)}
                />
                {cargo?.exige_documento && cargo.documentos.length > 0 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {cargo.documentos.map((documento, documentoIndex) => (
                        <FormFileField<ProfissionalSchema>
                          key={`${documento.uuid ?? documento.id}-${documentoIndex}`}
                          name={`funcoes.${index}.documentos.${documentoIndex}.arquivo`}
                          label={documento.nome}
                          description="Selecione o arquivo obrigatório deste cargo."
                          variant="documento"
                          multiple={false}
                          accept=".pdf,.png,.jpeg,.jpg"
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-3 rounded-md bg-[#F38D1C1A] px-3 py-2">
                      <CircleAlert className="size-5 shrink-0 text-secondary" />
                      <p className="text-sm text-gray-500">
                        Anexe os documentos obrigatórios deste cargo. Cada arquivo deve corresponder
                        ao documento definido no cadastro do cargo.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={fields.length >= opcoesCargo.length}
            onClick={() => append(FUNCAO_VAZIA)}
            className={
              fields.length >= opcoesCargo.length
                ? "border border-blocked-foreground text-blocked-foreground"
                : ""
            }
          >
            <Plus className="size-4" /> Adicionar função
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}
