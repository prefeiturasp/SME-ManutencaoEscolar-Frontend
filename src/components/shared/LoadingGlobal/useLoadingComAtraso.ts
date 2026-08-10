"use client";

import { useEffect, useState } from "react";

export const ATRASO_PARA_EXIBIR_LOADING_MS = Number(
  process.env.NEXT_PUBLIC_LOADING_ATRASO_MS ?? 1000,
);

/**
 * Evita "flash" de loading em todos os cadastros. Só exibe o loading se a operação demorar mais que o atraso configurado.
 * @param conteudo Conteúdo a ser exibido (ex: loading)
 * @param atraso Atraso em milissegundos antes de exibir o conteúdo. Padrão: 1000ms.
 * @returns Conteúdo a ser exibido após o atraso, ou null se ainda não passou o tempo.
 */
export function useLoadingComAtraso<T>(
  conteudo: T | null,
  atraso: number = ATRASO_PARA_EXIBIR_LOADING_MS,
): T | null {
  const [conteudoExibido, setConteudoExibido] = useState<T | null>(null);

  useEffect(() => {
    const timeout = setTimeout(
      () => setConteudoExibido(conteudo),
      conteudo ? atraso : 0,
    );

    return () => clearTimeout(timeout);
  }, [conteudo, atraso]);

  return conteudoExibido;
}
