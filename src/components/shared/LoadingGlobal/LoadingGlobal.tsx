"use client";

import { LoadingSpinner } from "@/components/icons/LoadingSpinner";
import { cn } from "@/lib/utils";
import { useMutationState } from "@tanstack/react-query";

type InformacaoLoading = {
  titulo: string;
  mensagem?: string;
};

type MutationMeta = {
  loading?: InformacaoLoading;
};

type LoadingGlobalProps = {
  exibir?: boolean;
  local?: boolean;
  titulo?: string;
  mensagem?: string;
};

export function LoadingGlobal({
  exibir = false,
  local = false,
  titulo,
  mensagem,
}: Readonly<LoadingGlobalProps>) {
  const loadings = useMutationState({
    filters: {
      status: "pending",
    },
    select: (mutation) => {
      const meta = mutation.options.meta as MutationMeta | undefined;

      return meta?.loading ?? null;
    },
  });

  const loadingMutation = loadings.findLast(
    (loading): loading is InformacaoLoading => loading !== null,
  );

  const loadingManual = exibir
    ? {
        titulo,
        mensagem,
      }
    : null;

  const loadingAtual = loadingManual ?? loadingMutation;

  if (!loadingAtual) {
    return null;
  }

  const conteudo = (
    <div
      role="status"
      aria-live="polite"
      aria-label={loadingAtual.mensagem}
      aria-busy="true"
      className={cn(
        local
          ? "flex min-h-40 flex-col items-center justify-center rounded-md p-6 text-[var(--disabled-text)]"
          : "flex min-h-40 flex-col items-center justify-center rounded-md p-6",
        local ? "w-full" : "w-[352px] bg-background shadow-lg",
      )}
    >
      <LoadingSpinner className="mb-5" />

      <p className="text-center text-base font-bold">{loadingAtual.titulo}</p>

      <p className="mt-1 text-center text-sm text-muted-foreground">
        {loadingAtual.mensagem}
      </p>
    </div>
  );

  if (local) {
    return conteudo;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      {conteudo}
    </div>
  );
}
