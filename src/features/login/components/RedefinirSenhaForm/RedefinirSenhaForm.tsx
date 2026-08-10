"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlterarSenha } from "@/features/login/hooks/useRedefinirSenha";
import {
  redefinirSenhaSchema,
  type RedefinirSenhaFormData,
} from "@/features/login/schemas/redefinirSenhaSchema";
import {
  ErroApi,
  RedefinirSenhaFormProps,
  ResultadoRedefinicao,
} from "@/features/login/types/alterarSenha.types";
import { useEffect, useState } from "react";
import { CriteriosSenha } from "../CriteriosSenha.tsx/CriteriosSenha";
import { ResultadoRedefinirSenha } from "../ResultadoRedefinirSenha/ResultadoRedefinirSenha";

export function RedefinirSenhaForm({ token, id }: RedefinirSenhaFormProps) {
  const [resultado, setResultado] = useState<ResultadoRedefinicao>(null);
  const [erroApi, setErroApi] = useState<ErroApi | null>(null);

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const { mutateAsync: alterarSenha, isPending } = useAlterarSenha();

  const form = useForm<RedefinirSenhaFormData>({
    resolver: zodResolver(redefinirSenhaSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      novaSenha: "",
      confirmacao_senha: "",
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
  const confirmacao_senha = watch("confirmacao_senha");

  useEffect(() => {
    setErroApi(null);
    if (confirmacao_senha.length > 0) {
      void trigger("confirmacao_senha");
    }
  }, [novaSenha, confirmacao_senha, trigger]);

  async function onSubmit(data: RedefinirSenhaFormData) {
    setErroApi(null);

    const resposta = await alterarSenha({
      registro_funcional_ou_cpf: id,
      token,
      senha: data.novaSenha,
      confirmacao_senha: data.confirmacao_senha,
    });

    if (resposta.success) {
      setResultado({
        tipo: "sucesso",
      });

      return;
    }

    if (resposta.title === "O link está expirado!") {
      setResultado({
        tipo: "token-expirado",
        title: resposta.title,
        detail: resposta.detail,
      });

      return;
    }

    setErroApi({
      title: resposta.title,
      detail: resposta.detail,
    });
  }

  if (resultado) {
    return (
      <ResultadoRedefinirSenha
        tipo={resultado.tipo}
        title={
          resultado.tipo === "token-expirado" ? resultado.title : undefined
        }
        detail={
          resultado.tipo === "token-expirado" ? resultado.detail : undefined
        }
      />
    );
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
                <Eye className="size-4" />
              ) : (
                <EyeOff className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div className="min-h-5 mb-8">
          <CriteriosSenha senha={novaSenha} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmacao_senha"
            className="text-sm font-bold text-gray"
          >
            Confirmação da nova senha
          </label>

          <div className="relative w-[460px] mt-2">
            <Input
              id="confirmacao_senha"
              type={mostrarConfirmacao ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirme sua nova senha"
              className="w-full pr-11"
              {...register("confirmacao_senha")}
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

          {erroApi && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-8 flex min-h-[48px] w-[460px] items-center justify-center rounded-lg border border-[var(--error-login)] px-6 py-3 text-center text-sm font-bold leading-5 text-[var(--error-login)]"
            >
              {erroApi.detail}
            </div>
          )}

          <div className={errors.confirmacao_senha ? "min-h-5 mt-8" : ""}>
            {errors.confirmacao_senha && (
              <div
                role="alert"
                aria-live="polite"
                className="flex min-h-[48px] w-[460px] items-center justify-center rounded-lg border border-[var(--error-login)] px-6 py-3 text-center text-sm font-bold leading-5 text-[var(--error-login)]"
              >
                {errors.confirmacao_senha.message}
              </div>
            )}
          </div>
        </div>

        <div
          className={
            errors.confirmacao_senha
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
