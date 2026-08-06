import { CircleCheck, CircleX } from "lucide-react";

import { Button } from "@/components/ui/button";

type ResultadoRecuperacaoSenhaProps = {
  tipo: "sucesso" | "erro";
  onContinuar: () => void;
};

export function ResultadoRecuperacaoSenha({
  tipo,
  onContinuar,
}: Readonly<ResultadoRecuperacaoSenhaProps>) {
  const sucesso = tipo === "sucesso";

  return (
    <section className="flex w-[460px] flex-col gap-6">
      <h1 className="text-xl font-bold">Recuperação de senha</h1>

      <div
        role={sucesso ? "status" : "alert"}
        className={
          sucesso
            ? "flex gap-3 rounded-md bg-green-50 p-4 text-green-800"
            : "flex gap-3 rounded-md bg-red-50 p-4 text-red-800"
        }
      >
        {sucesso ? (
          <CircleCheck className="mt-0.5 size-5 shrink-0" />
        ) : (
          <CircleX className="mt-0.5 size-5 shrink-0" />
        )}

        <div>
          <p className="text-sm font-bold text-[var(--background-gray)]">
            {sucesso
              ? "Link enviado com sucesso!"
              : "Não foi possível enviar o link."}
          </p>

          <p className="mt-2 text-sm text-[var(--background-gray)]">
            {sucesso
              ? "Verifique sua caixa de entrada ou lixo eletrônico."
              : "Verifique os dados informados e tente novamente."}
          </p>
        </div>
      </div>

      <Button type="button" size="lg" onClick={onContinuar}>
        Continuar
      </Button>
    </section>
  );
}
