"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  redefinirSenhaSchema,
  type RedefinirSenhaFormData,
} from "../../schemas/redefinirSenhaSchema";
import { CriteriosSenha } from "../CriteriosSenha.tsx/CriteriosSenha";
import { ResultadoRedefinirSenha } from "../ResultadoRedefinirSenha/ResultadoRedefinirSenha";

type RedefinirSenhaFormProps = Readonly<{
  token: string;
  id?: string;
}>;

type ResultadoRedefinicao = "sucesso" | "token-expirado" | null;

export function RedefinirSenhaForm({ token, id }: RedefinirSenhaFormProps) {
  console.log("Token recebido:", token);
  console.log("ID recebido:", id);
  const router = useRouter();
  const [resultado, setResultado] = useState<ResultadoRedefinicao>(null);

  const [isPending, setIsPending] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const form = useForm<RedefinirSenhaFormData>({
    resolver: zodResolver(redefinirSenhaSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      novaSenha: "",
      confirmacaoSenha: "",
    },
  });

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isValid },
  } = form;

  const novaSenha = watch("novaSenha");
  const confirmacaoSenha = watch("confirmacaoSenha");

  useEffect(() => {
    if (confirmacaoSenha.length > 0) {
      void trigger("confirmacaoSenha");
    }
  }, [novaSenha, confirmacaoSenha, trigger]);

  async function onSubmit(data: RedefinirSenhaFormData) {
    setIsPending(true);

    try {
      console.log({
        token,
        novaSenha: data.novaSenha,
        id,
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      const respostaSucesso = true;

      setResultado(respostaSucesso ? "sucesso" : "token-expirado");
    } finally {
      setIsPending(false);
    }
  }

  if (resultado) {
    return <ResultadoRedefinirSenha tipo={resultado} />;
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col"
        noValidate
      >
        <header className="">
          <h1 className="font-roboto text-xl font-bold mb-8 text-gray">
            Crie uma nova senha
          </h1>

          <p className="text-sm text-gray mb-8">
            Esta será sua nova senha de acesso ao Conserta Aí.
          </p>
        </header>

        <div className="space-y-2 mb-8">
          <label htmlFor="novaSenha" className="text-sm font-bold text-gray">
            Nova senha
          </label>

          <div className="relative w-[460px] mt-2">
            <Input
              id="novaSenha"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Digite sua nova senha"
              className="w-full pr-11"
              {...register("novaSenha")}
            />

            <button
              type="button"
              aria-label={
                mostrarSenha ? "Ocultar nova senha" : "Mostrar nova senha"
              }
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
              onClick={() => setMostrarSenha((valor) => !valor)}
            >
              {mostrarSenha ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div className="min-h-5 mb-8">
          <CriteriosSenha senha={novaSenha} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmacaoSenha"
            className="text-sm font-bold text-gray"
          >
            Confirmação da nova senha
          </label>

          <div className="relative w-[460px] mt-2">
            <Input
              id="confirmacaoSenha"
              type={mostrarConfirmacao ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirme sua nova senha"
              className="w-full pr-11"
              {...register("confirmacaoSenha")}
            />

            <button
              type="button"
              aria-label={
                mostrarConfirmacao
                  ? "Ocultar confirmação da senha"
                  : "Mostrar confirmação da senha"
              }
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
              onClick={() => setMostrarConfirmacao((valor) => !valor)}
            >
              {mostrarConfirmacao ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>

          <div className={errors.confirmacaoSenha ? "min-h-5 mt-8" : ""}>
            {errors.confirmacaoSenha && (
              <div
                role="alert"
                aria-live="polite"
                className={
                  errors.confirmacaoSenha
                    ? "flex min-h-[48px] w-[460px] items-center justify-center rounded-lg border border-[var(--error-login)] px-6 py-3 text-center text-sm font-bold leading-5 text-[var(--error-login)]"
                    : "hidden"
                }
              >
                {errors.confirmacaoSenha.message}
              </div>
            )}
          </div>
        </div>

        <div
          className={
            errors.confirmacaoSenha
              ? "flex w-[460px] flex-col mt-8"
              : "flex w-[460px] flex-col mt-6"
          }
        >
          <Button
            type="submit"
            size="lg"
            disabled={!isValid || isPending}
            className={
              isPending
                ? "w-[460px] bg-[var(--primary-dark)] mb-2 disabled:bg-[var(--primary-dark)] disabled:text-primary-foreground disabled:opacity-100"
                : "w-[460px] bg-[var(--primary-dark)] mb-2"
            }
          >
            {isPending ? (
              <>
                <LoaderCircle className="size-5 animate-spin" />
                <span className="sr-only">Salvando senha...</span>
              </>
            ) : (
              "Salvar senha"
            )}
          </Button>

          <Button
            asChild
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
          >
            <Link href="/login">Cancelar</Link>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
