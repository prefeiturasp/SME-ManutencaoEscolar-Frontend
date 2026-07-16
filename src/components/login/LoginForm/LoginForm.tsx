"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormData } from "@/schemas/auth/loginSchema";
import Image from "next/image";
import logoPrefeitura from "../../../assets/images/logo_PrefSP_sem fundo_horizontal_fundo_claro.jpg";
import { HelpIcon } from "@/components/icons/tooltip";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    console.log(data);
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
            htmlFor="email"
            className="text-sm font-normal text-muted-foreground"
          >
            RF, CPF ou e-mail
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
                insira o RF. Para fornecedores, informe o CPF ou e-mail.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Digite o RF, CPF ou e-mail"
          className="w-[460px]"
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
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
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
      </div>

      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-[460px]"
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? "Entrando..." : "Acessar"}
      </Button>

      <div className="flex flex-col items-center gap-8">
        <Link
          href="/recuperar-senha"
          className="text-sm font-bold text-secondary hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>
    </form>
  );
}
