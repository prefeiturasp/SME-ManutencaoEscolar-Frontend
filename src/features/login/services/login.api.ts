"use server";

import axios from "axios";
import { cookies } from "next/headers";

import { api } from "@/actions/http/client";
import type {
  LoginCredentials,
  LoginResult,
} from "@/features/login/types/login.types";

type LoginApiResponse = {
  access: string;
  refresh?: string;
  dados_usuario: {
    nome: string;
    codigo_rf_ou_cpf: string;
    cargo: string;
    diretoria_regional: string | null;
    unidade_educacional: string | null;
  };
};

type LoginApiError = {
  login?: string[];
  senha?: string[];
  detail?: string;
  message?: string;
};

export async function loginAction(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  try {
    const { data } = await api.post<LoginApiResponse>("/api/v1/login/", {
      login: credentials.login,
      senha: credentials.senha,
    });

    const cookieStore = await cookies();

    const usuario = {
      nome: data.dados_usuario.nome,
      codigoRfOuCpf: data.dados_usuario.codigo_rf_ou_cpf,
      cargo: data.dados_usuario.cargo,
      diretoriaRegional: data.dados_usuario.diretoria_regional,
      unidadeEducacional: data.dados_usuario.unidade_educacional,
    };

    cookieStore.set("accessToken", data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return {
      success: true,
      user: usuario,
    };
  } catch (error) {
    if (axios.isAxiosError<LoginApiError>(error)) {
      const body = error.response?.data;

      const message =
        body?.login?.[0] ?? body?.senha?.[0] ?? body?.detail ?? body?.message;

      return {
        success: false,
        error: message ?? "Os dados informados são inválidos.",
      };
    }

    return {
      success: false,
      error:
        "Parece que estamos com uma instabilidade. Tente novamente em alguns instantes.",
    };
  }
}
