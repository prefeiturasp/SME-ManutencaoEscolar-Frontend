"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { USUARIO_AUTENTICADO_QUERY_KEY } from "../constants/usuarioQueryKey";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { obterUsuarioAutenticado } from "../services/usuario.api";

/**
 * Consulta o usuário autenticado em `/usuarios/me` e mantém o store
 * sincronizado com o perfil e as funcionalidades vindos do backend.
 */
export function useUsuarioAutenticado() {
  const definirUsuario = useUsuarioStore((estado) => estado.definirUsuario);

  const consulta = useQuery({
    queryKey: USUARIO_AUTENTICADO_QUERY_KEY,
    queryFn: obterUsuarioAutenticado,
    staleTime: 60 * 1000,
    retry: false,
  });

  const { data } = consulta;

  useEffect(() => {
    if (data) definirUsuario(data);
  }, [data, definirUsuario]);

  return consulta;
}
