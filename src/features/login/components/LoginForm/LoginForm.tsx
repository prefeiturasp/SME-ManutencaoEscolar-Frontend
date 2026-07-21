"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { HelpIcon } from "@/components/icons/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  loginSchema,
  type LoginFormData,
} from "@/features/login/schemas/loginSchema";
import { useState } from "react";
import { useLogin } from "../../hooks/useLogin";

export function LoginForm() {
  const loginMutation = useLogin();
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      login: "",
      senha: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setMensagemErro(null);

    const result = await loginMutation.mutateAsync({
      login: data.login,
      senha: data.senha,
    });
    if (!result.success) {
      setMensagemErro(result.error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-6"
      noValidate
    >
      <header className="space-y-2"></header>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label
            htmlFor="login"
            className="text-sm font-normal text-muted-foreground"
          >
            RF ou CPF
          </label>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Informações sobre o campo"
                  className="cursor-pointer"
                >
                  <HelpIcon className="h-4 w-4" />
                </button>
              </TooltipTrigger>

              <TooltipContent
                side="top"
                align="start"
                alignOffset={12}
                sideOffset={8}
                arrowPadding={12}
                className="w-[375px] rounded-md bg-[var(--background-gray)] px-4 py-3 text-center text-sm leading-5 text-white"
              >
                Caso faça parte de uma Diretoria Regional de Ensino (DRE),
                insira o RF. Para fornecedores, informe o CPF.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Input
          id="login"
          type="text"
          autoComplete="username"
          placeholder="Digite o RF ou CPF"
          className="w-[460px]"
          {...register("login")}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-normal text-muted-foreground"
        >
          Senha
        </label>

        <Input
          id="password"
          type="password"
          className="w-[460px]"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          {...register("senha")}
        />
      </div>

      <Button
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
          "Acessar"
        )}
      </Button>

      <div className="flex flex-col items-center gap-8">
        <Link
          href="/"
          className="text-sm font-bold text-secondary hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>

      {mensagemErro && (
        <div
          role="alert"
          aria-live="polite"
          className="flex min-h-[48px] w-[460px] items-center justify-center rounded-lg border border-[var(--error-login)] px-6 py-3 text-center text-sm font-bold leading-5 text-[var(--error-login)]"
        >
          {mensagemErro}
        </div>
      )}
    </form>
  );
}
