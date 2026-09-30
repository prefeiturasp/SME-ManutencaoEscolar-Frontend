"use client";
import { AlertaErro } from "@/components/shared/AlertaErro/AlertaErro";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { CargoFormData, cargoSchema } from "@/features/cargo/schemas/cargoSchema";
import { useFeedbackEntidade } from "@/hooks/useFeedbackEntidade";
import { formatarDataHora } from "@/utils/formatadores";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { useEditarCargo } from "../hooks/useEditarCargo";
import { Cargo } from "../types/cargos.types";
import { ExcluirCargoModal } from "./ExcluirCargoModal";
import { FormCargo } from "./FormCargo";

type EditarCargoFormProps = Readonly<{
  uuid: string;
  cargo: Cargo;
}>;

function converterExigeDocumento(valor: boolean | undefined): CargoFormData["exige_documento"] {
  if (valor === undefined) {
    return undefined;
  }

  return valor ? "true" : "false";
}

export function EditarCargoForm({ uuid, cargo }: EditarCargoFormProps) {
  const { mutate: editarCargo } = useEditarCargo(uuid);

  const { tratarResultado, tratarErroInesperado, alertaProps } = useFeedbackEntidade({
    mensagemSucesso: "As alterações foram salvas.",
    contextoErro: "editar cargo",
    rotaRetorno: "/cargos",
  });

  const methods = useForm<CargoFormData>({
    resolver: zodResolver(cargoSchema),
    mode: "onChange",
    defaultValues: {
      nome: cargo.nome ?? "",
      exige_documento: converterExigeDocumento(cargo.exige_documento),
      novo_documento: "",
      documentos: cargo.documentos.map((documento) => ({
        nome: documento.nome,
      })),
    },
  });

  const {
    handleSubmit,
    formState: { isValid, isDirty },
  } = methods;

  function onSubmit(dados: CargoFormData) {
    const { novo_documento: novoDocumento, ...dadosCargo } = dados;
    const documentos = [
      ...(dados.documentos ?? []),
      ...(novoDocumento?.trim()
        ? [
            {
              nome: novoDocumento.trim(),
            },
          ]
        : []),
    ];
    const payload = {
      ...dadosCargo,
      documentos,
    };

    editarCargo(payload, {
      onSuccess: tratarResultado,
      onError: tratarErroInesperado,
    });
  }

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Editar Cargo</h1>

            <div className="flex gap-2">
              <Button
                asChild
                type="button"
                variant="outline"
                size="big-lg"
                className="max-w-[88px]"
              >
                <Link href="/cargos">Cancelar</Link>
              </Button>

              <ExcluirCargoModal uuid={uuid} />

              <Button
                type="submit"
                variant="default"
                size="big-lg"
                className="max-w-[72px]"
                disabled={!isValid || !isDirty}
              >
                Salvar
              </Button>
            </div>
          </div>
          <Card className="relative p-6">
            <CardTitle className="text-sm text-muted-foreground">
              Preencha as informações e clique em “salvar” para armazenar os dados.
            </CardTitle>

            <FormCargo />

            <div className="mt-2 text-xs font-bold text-gray">
              <p>
                INSERIDO por {cargo.criado_por_nome ?? "Não informado"} ({cargo.username}) em{" "}
                {formatarDataHora(cargo.criado_em)}
              </p>

              <p>
                ALTERADO por {cargo.atualizado_por_nome ?? "Não informado"} ({cargo.username}) em{" "}
                {formatarDataHora(cargo.atualizado_em)}
              </p>
            </div>
          </Card>
        </form>
      </FormProvider>
      <AlertaErro
        aberto={alertaProps.aberto}
        titulo={alertaProps.titulo}
        mensagem={alertaProps.mensagem}
        onOpenChange={alertaProps.onOpenChange}
      />
    </div>
  );
}
