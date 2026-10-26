"use client";

import type { ReactNode } from "react";

import type { Funcionalidade } from "@/constants/funcionalidades";
import { usePermissoes } from "@/hooks/usePermissoes";

type ExibirSePermitidoProps = Readonly<{
  funcionalidade: Funcionalidade;
  children: ReactNode;
  fallback?: ReactNode;
}>;

/** Renderiza o conteúdo somente se o perfil do usuário tiver a funcionalidade. */
export function ExibirSePermitido({
  funcionalidade,
  children,
  fallback = null,
}: ExibirSePermitidoProps) {
  const { temAcesso } = usePermissoes();

  return temAcesso(funcionalidade) ? children : fallback;
}
