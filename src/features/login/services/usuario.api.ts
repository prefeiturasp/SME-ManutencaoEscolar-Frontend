"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { Usuario } from "@/features/login/types/login.types";
import { mapearUsuario } from "@/features/login/utils/mapearUsuario";

export async function obterUsuarioAutenticado() {
  const usuario = await requisicaoAutenticada<Usuario>({
    method: "GET",
    url: "/usuarios/me/",
  });

  return mapearUsuario(usuario);
}
