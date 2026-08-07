"use client";

import { CircleCheck, CircleX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type ResultadoRedefinirSenhaProps = Readonly<{
  tipo: "sucesso" | "token-expirado";
}>;

export function ResultadoRedefinirSenha({
  tipo,
}: ResultadoRedefinirSenhaProps) {
  const sucesso = tipo === "sucesso";

  return (
    <div className="flex w-full flex-col">
      <h1 className="mb-8 text-xl font-bold text-[var(--background-gray)]">
        {sucesso ? "Recuperação de senha" : "O link está expirado!"}
      </h1>

      <div
        role="alert"
        className={
          sucesso
            ? "mb-8 flex min-h-[64px] items-center gap-3 rounded-lg bg-[var(--aproved-background)]/10 px-5 py-4 text-sm text-green-800"
            : "mb-8 flex min-h-[64px] items-center gap-3 rounded-lg bg-red-50 px-5 py-4 text-sm text-red-800"
        }
      >
        {sucesso ? (
          <CircleCheck
            className="size-5 shrink-0 color-[var(--aproved-background)]"
            aria-hidden="true"
          />
        ) : (
          <CircleX className="size-5 shrink-0" aria-hidden="true" />
        )}

        <span className="text-gray">
          {sucesso
            ? "Você já pode acessar o Manutenção Escolar com sua nova senha."
            : "Por segurança, o link de redefinição expirou. Solicite um novo para redefinir sua senha."}
        </span>
      </div>

      <div className="flex w-full flex-col gap-2">
        <Button asChild size="lg" className="w-full bg-[var(--primary-dark)]">
          <Link href={sucesso ? "/login" : "/login/recuperar-senha"}>
            {sucesso ? "Acessar agora" : "Solicitar novo link"}
          </Link>
        </Button>

        {!sucesso && (
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/login">Cancelar</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
