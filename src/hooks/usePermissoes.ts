"use client";

import type { Funcionalidade } from "@/constants/funcionalidades";
import { useUsuarioStore } from "@/stores/useUsuarioStore";

/** Expõe as funcionalidades liberadas ao usuário autenticado. */
export function usePermissoes() {
  const funcionalidades = useUsuarioStore((estado) => estado.usuario?.funcionalidades);

  function temAcesso(funcionalidade: Funcionalidade): boolean {
    return funcionalidades?.includes(funcionalidade) ?? false;
  }

  return { temAcesso };
}
