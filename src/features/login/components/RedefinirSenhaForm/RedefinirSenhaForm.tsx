"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlterarSenha } from "@/features/login/hooks/useRedefinirSenha";
import {
  redefinirSenhaSchema,
  type RedefinirSenhaFormData,
} from "@/features/login/schemas/redefinirSenhaSchema";
import type {
  ErroApi,
  RedefinirSenhaFormProps,
  ResultadoRedefinicao,
} from "@/features/login/types/alterarSenha.types";

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
      confirmarSenha: "",
    },
  });

  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors, isValid },
  } = form;

  const novaSenha = useWatch({
    control,
    name: "novaSenha",
  });

  const confirmarSenha = useWatch({
    control,
    name: "confirmarSenha",
  });

  useEffect(() => {
    if (confirmarSenha.length > 0) {
      void trigger("confirmarSenha");
    }
  }, [novaSenha, confirmarSenha, trigger]);

  async function onSubmit(data: RedefinirSenhaFormData) {
    setErroApi(null);

    const resposta = await alterarSenha({
      registro_funcional_ou_cpf: id,
      token,
      senha: data.novaSenha,
      confirmacao_senha: data.confirmarSenha,
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
        <header>
          <h1 className="font-roboto mb-8 text-xl font-bold text-gray">
            Crie uma nova senha
          </h1>

          <p className="mb-8 text-sm text-gray">
            Esta será sua nova senha de acesso ao Manutenção Escolar.
          </p>
        </header>

        <div className="mb-8 space-y-2">
          <label htmlFor="novaSenha" className="text-sm font-bold text-gray">
            Nova senha
          </label>

          <div className="relative mt-2 w-[460px]">
            <Input
              id="novaSenha"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Digite sua nova senha"
              className="w-full pr-11"
              {...register("novaSenha", {
                onChange: () => {
                  setErroApi(null);
                },
              })}
            />

            <button
              type="button"
              aria-label={
                mostrarSenha ? "Ocultar nova senha" : "Mostrar nova senha"
              }
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
              onClick={() => {
                setMostrarSenha((valor) => !valor);
              }}
            >
              {mostrarSenha ? (
                <Eye className="size-4" />
              ) : (
                <EyeOff className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div className="mb-8 min-h-5">
          <CriteriosSenha senha={novaSenha} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmarSenha"
            className="text-sm font-bold text-gray"
          >
            Confirmação da nova senha
          </label>

          <div className="relative mt-2 w-[460px]">
            <Input
              id="confirmarSenha"
              type={mostrarConfirmacao ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirme sua nova senha"
              className="w-full pr-11"
              {...register("confirmarSenha", {
                onChange: () => {
                  setErroApi(null);
                },
              })}
            />

            <button
              type="button"
              aria-label={
                mostrarConfirmacao
                  ? "Ocultar confirmação da senha"
                  : "Mostrar confirmação da senha"
              }
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
              onClick={() => {
                setMostrarConfirmacao((valor) => !valor);
              }}
            >
              {mostrarConfirmacao ? (
                <Eye className="size-4" />
              ) : (
                <EyeOff className="size-4" />
              )}
            </button>
          </div>

          {erroApi && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-8 flex min-h-[48px] w-[460px] items-center justify-center rounded-lg border border-[var(--error-login)] px-6 py-3 text-center text-sm leading-5 font-bold text-[var(--error-login)]"
            >
              {erroApi.detail}
            </div>
          )}

          <div className={errors.confirmarSenha ? "mt-8 min-h-5" : ""}>
            {errors.confirmarSenha && (
              <div
                role="alert"
                aria-live="polite"
                className="flex min-h-[48px] w-[460px] items-center justify-center rounded-lg border border-[var(--error-login)] px-6 py-3 text-center text-sm leading-5 font-bold text-[var(--error-login)]"
              >
                {errors.confirmarSenha.message}
              </div>
            )}
          </div>
        </div>

        <div
          className={
            errors.confirmarSenha
              ? "mt-8 flex w-[460px] flex-col"
              : "mt-6 flex w-[460px] flex-col"
          }
        >
          <Button
            type="submit"
            size="lg"
            disabled={!isValid || isPending}
            className={
              isPending
                ? "mb-2 w-[460px] bg-[var(--primary-dark)] disabled:bg-[var(--primary-dark)] disabled:text-primary-foreground disabled:opacity-100"
                : "mb-2 w-[460px] bg-[var(--primary-dark)]"
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
