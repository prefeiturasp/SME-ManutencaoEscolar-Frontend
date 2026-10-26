"use server";

import axios from "axios";
import { cookies } from "next/headers";

import { api } from "@/actions/http/client";
import {
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/constants/autenticacao";
import type {
  LoginApiResponse,
  LoginCredenciais,
  ResultadoLogin,
  Usuario,
} from "@/features/login/types/login.types";
import { mapearUsuario } from "@/features/login/utils/mapearUsuario";

type LoginApiError = {
  login?: string[];
  senha?: string[];
  detail?: string;
  message?: string;
};

export async function loginAction(
  credenciais: LoginCredenciais,
): Promise<ResultadoLogin> {
  try {
    const { data } = await api.post<LoginApiResponse>("/login/", {
      login: credenciais.login,
      senha: credenciais.senha,
    });

    const { data: dadosUsuario } = await api.get<Usuario>("/usuarios/me/", {
      headers: { Authorization: `Bearer ${data.access}` },
    });

    const usuario = mapearUsuario(dadosUsuario);

    const cookieStore = await cookies();

    cookieStore.set("accessToken", data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    cookieStore.set("refreshToken", data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
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
