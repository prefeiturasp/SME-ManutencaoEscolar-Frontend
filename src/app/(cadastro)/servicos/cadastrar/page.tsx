"use client";

import { AlertaErro } from "@/components/shared/AlertaErro/AlertaErro";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { toastErro, toastSucesso } from "@/components/ui/toast-custom";
import { FormServico } from "@/features/servico/components/Servico/FormServico";
import { useCriarServico } from "@/features/servico/hooks/useCriarServico";
import {
  servicoSchema,
  type ServiceFormData,
} from "@/features/servico/schemas/servicoSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { CadastroBreadcrumb } from "../../CadastroBreadcrumb";

export default function CadastrarServicoPage() {
  const methods = useForm<ServiceFormData>({
    resolver: zodResolver(servicoSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      status: undefined,
    },
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = methods;

  const { mutate } = useCriarServico();
  const [erroAberto, setErroAberto] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemErroTitulo, setMensagemErroTitulo] = useState("");
  const router = useRouter();

  function onSubmit(dados: ServiceFormData) {
    mutate(dados, {
      onSuccess: (resultado) => {
        if (resultado.success) {
          toastSucesso({
            titulo: "Sucesso!",
            descricao: "O serviço foi cadastrado.",
          });
          return;
        }

        if (resultado.status === 400) {
          setMensagemErro(resultado.message);
          setMensagemErroTitulo(resultado.title);
          setErroAberto(true);
        }

        if (resultado.status === 500) {
          toastErro({
            titulo: resultado.title ?? "Erro",
            descricao:
              resultado.message ??
              "Não conseguimos cadastrar o serviço. Por favor, tente novamente.",
          });

          router.replace("/servicos");
        }
      },

      onError: (error) => {
        console.error("Erro inesperado ao cadastrar serviço:", error);
      },
    });
  }

  return (
    <>
      <CadastroBreadcrumb />
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Cadastro de Serviço</h1>

            <div className="flex gap-2">
              <Link
                href="/servicos/"
                className="flex items-center gap-2"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="big-lg"
                  className="max-w-[88px]"
                >
                  Cancelar
                </Button>
              </Link>

              <Button
                type="submit"
                variant="default"
                size="big-lg"
                disabled={!isValid || isSubmitting}
              >
                Cadastrar serviço
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <CardTitle className="text-sm text-muted-foreground">
              Preencha as informações e clique em “cadastrar serviço” para
              armazenar os dados.
            </CardTitle>

            <FormServico />
          </Card>
        </form>
      </FormProvider>

      <AlertaErro
        aberto={erroAberto}
        titulo={mensagemErroTitulo}
        mensagem={mensagemErro}
        onOpenChange={setErroAberto}
      />
    </>
  );
}
