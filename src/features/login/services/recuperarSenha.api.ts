"use server";

import axios from "axios";

import { api } from "@/actions/http/client";
import type {
  RecuperarSenhaApiError,
  RecuperarSenhaApiResponse,
  RecuperarSenhaCredenciais,
  ResultadoRecuperarSenha,
} from "../types/recuperarSenha.types";

export async function recuperarSenhaAction(
  credenciais: RecuperarSenhaCredenciais,
): Promise<ResultadoRecuperarSenha> {
  try {
    const { data } = await api.post<RecuperarSenhaApiResponse>(
      "/redefinir-senha/",
      {
        registro_funcional_ou_cpf: credenciais.login,
      },
    );

    return {
      success: true,
      email: data.email,
    };
  } catch (error) {
    if (axios.isAxiosError<RecuperarSenhaApiError>(error)) {
      const body = error.response?.data;

      return {
        success: false,
        title: body?.title ?? "Não foi possível enviar o link.",
        detail:
          body?.detail ?? "Verifique os dados informados e tente novamente.",
      };
    }

    return {
      success: false,
      title: "Não foi possível enviar o link.",
      detail:
        "Parece que estamos com uma instabilidade. Tente novamente em alguns instantes.",
    };
  }
}
