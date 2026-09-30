"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";

import { FormMaskedField, FormSelectField, FormTextField } from "@/components/form";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
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
import { formatarDataHora, maskCpf, unmaskCpf } from "@/utils/formatadores";
import { useProfissional } from "@/features/profissional/hooks/useProfissional";
import { useUpdateProfissional } from "@/features/profissional/hooks/useUpdateProfissional";

import { ProfissionalFuncaoCard } from "./ProfissionalFuncaoCard";

const FUNCAO_VAZIA = { uuid_cargo: "", documentos: [] };
const DEFAULT_VALUES: ProfissionalSchema = {
  nome: "",
  rg: "",
  cpf: "",
  status: undefined,
  funcoes: [FUNCAO_VAZIA],
};

export function ProfissionalForm({ uuid }: { readonly uuid?: string }) {
  const router = useRouter();
  const modoEdicao = Boolean(uuid);
  const uuidSeguro = uuid ?? "";

  const {
    data: profissional,
    isLoading: carregandoProfissional,
    isError,
  } = useProfissional(uuidSeguro);

  const criarProfissional = useCreateProfissional();
  const atualizarProfissional = useUpdateProfissional(uuidSeguro);
  const { data: respostaCargos } = useListarCargos({ page_size: "all" });
  const cargos = respostaCargos?.results ?? [];

  const form = useForm<ProfissionalSchema, unknown, ProfissionalSchemaOutput>({
    resolver: zodResolver(profissionalSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  useEffect(() => {
    if (!modoEdicao || !profissional) return;

    form.reset({
      nome: profissional.nome,
      rg: profissional.rg,
      cpf: profissional.cpf,
      status: profissional.status ? "true" : "false",
      funcoes:
        profissional.funcoes.length > 0
          ? profissional.funcoes.map((funcao) => ({
              uuid: funcao.uuid,
              uuid_cargo: funcao.uuid_cargo,
              documentos:
                funcao.documentos?.map((documento) => ({
                  uuid: documento.uuid,
                  nome_original: documento.nome_original,
                  arquivo_url: documento.arquivo,
                  arquivo: [],
                })) ?? [],
            }))
          : [FUNCAO_VAZIA],
    });
  }, [profissional, modoEdicao, form]);

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
        cargo.documentos.some((_, index) => {
          const documento = funcao.documentos?.[index];
          return !documento?.uuid && !documento?.arquivo?.[0];
        }),
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

  function auditoriaDaFuncao(index: number) {
    const uuidFuncao = funcoes?.[index]?.uuid;
    return profissional?.funcoes.find((funcao) => funcao.uuid === uuidFuncao);
  }

  function selecionarCargo(index: number, cargoUuid: string) {
    const cargo = cargos.find((item) => item.uuid === cargoUuid);
    form.setValue(
      `funcoes.${index}.documentos`,
      cargo?.exige_documento ? cargo.documentos.map(() => ({ arquivo: [] })) : [],
      { shouldDirty: true, shouldValidate: true },
    );
  }

  const salvando = modoEdicao ? atualizarProfissional.isPending : criarProfissional.isPending;

  const salvar = form.handleSubmit((payload) => {
    if (formularioIncompleto) return;

    const mutation = modoEdicao ? atualizarProfissional : criarProfissional;

    mutation.mutate(payload, {
      onSuccess: () => {
        toastSucesso({
          titulo: "Sucesso",
          descricao: modoEdicao ? "As alterações foram salvas." : "O profissional foi cadastrado.",
        });
        router.replace("/profissionais");
      },
      onError: (erro: Error) => {
        console.error(
          modoEdicao ? "Erro ao atualizar profissional:" : "Erro ao cadastrar profissional:",
          erro,
        );
        const errosCampos = erro instanceof ProfissionalApiError ? erro.fieldErrors : {};
        (["cpf", "rg"] as const).forEach((campo) => {
          const mensagem = errosCampos[campo];
          if (mensagem) form.setError(campo, { type: "server", message: mensagem });
        });
        toastErro({
          titulo: "Erro",
          descricao: modoEdicao
            ? "Não conseguimos salvar as alterações. Por favor, tente novamente."
            : "Não conseguimos cadastrar o profissional. Por favor, tente novamente.",
        });
      },
    });
  });

  if (modoEdicao && carregandoProfissional) return <LoadingGlobal exibir />;

  if (modoEdicao && (isError || !profissional)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <ListaVazio
          titulo="Esta informação não está mais disponível!"
          descricao="Este profissional não existe ou não pode mais ser editado."
          textoBotao="Voltar para profissionais"
          href="/profissionais"
          primary
          icone={RotateCw}
        />
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="mx-auto w-full space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">
            {modoEdicao ? "Edição de profissional" : "Cadastro de profissional"}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/profissionais")}>
              Cancelar
            </Button>
            <Button
              variant={formularioIncompleto ? "blocked" : "default"}
              disabled={formularioIncompleto || salvando}
              onClick={() => void salvar()}
            >
              {modoEdicao ? "Salvar" : "Cadastrar profissional"}
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <CardContent className="space-y-4 p-0">
            <p className="text-sm text-muted-foreground">
              {modoEdicao
                ? "Atualize as informações e clique em “salvar alterações”."
                : "Preencha as informações e clique em “cadastrar profissional” para armazenar os dados."}
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
                alphanumeric
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
          const auditoria = auditoriaDaFuncao(index);
          const funcoesUsadas = new Set(
            funcoes
              ?.filter((_, outroIndex) => outroIndex !== index)
              .map((funcao) => funcao.uuid_cargo),
          );
          const opcoesDisponiveis = opcoesCargo.filter((opcao) => !funcoesUsadas.has(opcao.value));
          return (
            <ProfissionalFuncaoCard
              key={field.id}
              index={index}
              quantidadeFuncoes={fields.length}
              cargo={cargo}
              auditoria={auditoria}
              opcoesCargo={opcoesDisponiveis}
              onSelecionarCargo={(valor) => selecionarCargo(index, valor)}
              onRemover={() => remove(index)}
            />
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

        {modoEdicao && profissional && (
          <div className="mt-4 flex flex-col items-start font-bold text-gray text-[12px]">
            <p>
              INSERIDO por {profissional.criado_por ?? "Não informado"}{" "}
              {profissional.registro_funcional_criador ?? ""} em{" "}
              {formatarDataHora(profissional.criado_em)}
            </p>
            {profissional.atualizado_em && profissional.atualizado_por && (
              <p>
                ALTERADO por {profissional.atualizado_por}{" "}
                {profissional.registro_funcional_editor ?? ""} em{" "}
                {formatarDataHora(profissional.atualizado_em)}
              </p>
            )}
          </div>
        )}
      </div>
    </FormProvider>
  );
}
