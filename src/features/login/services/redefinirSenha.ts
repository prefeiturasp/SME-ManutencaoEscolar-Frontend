"use server";

import axios from "axios";

import { api } from "@/actions/http/client";
import type {
  AlterarSenhaCredenciais,
  ResultadoAlterarSenha,
} from "../types/alterarSenha.types";

export async function alterarSenhaAction(
  credenciais: AlterarSenhaCredenciais,
): Promise<ResultadoAlterarSenha> {
  try {
    await api.post("/alterar-senha/", {
      registro_funcional_ou_cpf: credenciais.registro_funcional_ou_cpf,
      token: credenciais.token,
      senha: credenciais.senha,
      confirmacao_senha: credenciais.confirmacao_senha,
    });

    return {
      success: true,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const body = error.response?.data;

      return {
        success: false,
        title: body?.title ?? "Não foi possível alterar a senha.",
        detail:
          body?.detail ??
          "O link pode estar inválido ou expirado. Solicite uma nova recuperação.",
      };
    }

    return {
      success: false,
      title: "Não foi possível alterar a senha.",
      detail:
        "Parece que estamos com uma instabilidade. Tente novamente em alguns instantes.",
    };
  }
}
