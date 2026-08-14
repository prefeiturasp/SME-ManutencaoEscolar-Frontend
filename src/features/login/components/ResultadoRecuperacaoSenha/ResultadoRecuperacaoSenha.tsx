import { CircleCheck, CircleX } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ResultadoRecuperarSenha } from "../../types/recuperarSenha.types";

type ResultadoRecuperacaoSenhaProps = {
  resultado: ResultadoRecuperarSenha;
  onContinuar: () => void;
};

export function ResultadoRecuperacaoSenha({
  resultado,
  onContinuar,
}: Readonly<ResultadoRecuperacaoSenhaProps>) {
  const sucesso = resultado.success;

  const titulo = resultado.success
    ? `Seu link de recuperação de senha foi enviado para ${resultado.email}.`
    : resultado.title;

  const detalhe = resultado.success
    ? "Verifique sua caixa de entrada ou lixo eletrônico."
    : resultado.detail;

  return (
    <section className="flex w-[460px] flex-col gap-8">
      <h1 className="font-roboto text-xl leading-none font-bold tracking-normal text-[var(--background-gray)]">
        Recuperação de senha
      </h1>

      <output
        role={sucesso ? "status" : "alert"}
        aria-live="polite"
        className={
          sucesso
            ? "flex gap-3 rounded-md bg-[#297805]/10 p-4 text-[#297805]"
            : "flex gap-3 rounded-md bg-red-50 p-4 text-red-800"
        }
      >
        {sucesso ? (
          <CircleCheck
            className="mt-0.5 size-[22px] shrink-0"
            aria-hidden="true"
          />
        ) : (
          <CircleX className="mt-0.5 size-[22px] shrink-0" aria-hidden="true" />
        )}

        <div>
          <p
            className={
              sucesso
                ? "text-sm text-[var(--background-gray)]"
                : "text-sm font-bold text-[var(--background-gray)]"
            }
          >
            {titulo}
          </p>

          <p className="mt-2 text-sm text-[var(--background-gray)]">
            {detalhe}
          </p>
        </div>
      </output>

      <Button
        type="button"
        size="lg"
        className="bg-[var(--primary-dark)]"
        onClick={onContinuar}
      >
        Continuar
      </Button>
    </section>
  );
}
