"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { FormTextField } from "@/components/form/FormTextField";
import { Button } from "@/components/ui/button";
import {
  RecuperarSenhaFormData,
  recuperarSenhaSchema,
} from "../../schemas/recuperarSenhaSchema";
import { ResultadoRecuperacaoSenha } from "../ResultadoRecuperacaoSenha/ResultadoRecuperacaoSenha";

export function RecuperarSenhaForm() {
  // const loginMutation = useLogin();
  // const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  type ResultadoRecuperacao = "sucesso" | "erro" | null;
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [resultado, setResultado] = useState<ResultadoRecuperacao>(null);

  const form = useForm<RecuperarSenhaFormData>({
    resolver: zodResolver(recuperarSenhaSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      login: "",
    },
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  async function onSubmit(data: RecuperarSenhaFormData) {
    setIsPending(true);

    console.log("Dados enviados:", data);

    // Troque para false para testar a tela de erro.
    const respostaSucesso = false;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setResultado(respostaSucesso ? "sucesso" : "erro");
    setIsPending(false);
  }

  if (resultado) {
    return (
      <ResultadoRecuperacaoSenha
        tipo={resultado}
        onContinuar={() => {
          router.push("/login");
          return;
        }}
      />
    );
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-6"
        noValidate
      >
        <header className="font-roboto text-xl leading-none font-bold tracking-normal text-[var(--background-gray)]">
          Recuperação de senha
        </header>

        <span className="text-sm font-normal text-muted-foreground text-[var(--background-gray)]">
          {" "}
          Informe o seu RF, CPF. Você receberá um e-mail com orientações para
          redefinir sua senha.
        </span>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor="login"
              className="text-sm font-normal text-muted-foreground"
            >
              RF ou CPF
            </label>
          </div>

          <FormTextField<RecuperarSenhaFormData>
            name="login"
            label=""
            placeholder="Digite o RF ou CPF"
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          {/* <Button
            type="submit"
            variant="default"
            size="lg"
            className={
              loginMutation.isPending
                ? "w-[460px] disabled:bg-primary disabled:text-primary-foreground disabled:opacity-100"
                : "w-[460px]"
            }
            disabled={!isValid || loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <LoaderCircle className="size-5 animate-spin" />
                <span className="sr-only">Entrando...</span>
              </>
            ) : (
              "Confirmar"
            )}
          </Button> */}

          <Button
            type="submit"
            variant="default"
            size="lg"
            className={
              isPending
                ? "w-[460px] disabled:bg-primary disabled:text-primary-foreground disabled:opacity-100"
                : "w-[460px]"
            }
            disabled={!isValid || isPending}
          >
            {isPending ? (
              <>
                <LoaderCircle className="size-5 animate-spin" />
                <span className="sr-only">Enviando...</span>
              </>
            ) : (
              "Confirmar"
            )}
          </Button>

          <Link href="/login" className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-[460px]"
            >
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </FormProvider>
  );
}
