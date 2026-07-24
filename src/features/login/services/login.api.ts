"use server";

import axios from "axios";
import { cookies } from "next/headers";

import { api } from "@/actions/http/client";
import type {
  LoginApiResponse,
  LoginCredenciais,
  ResultadoLogin,
} from "@/features/login/types/login.types";



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
    const { data } = await api.post<LoginApiResponse>("/api/v1/login/", {
      login: credenciais.login,
      senha: credenciais.senha,
    });

    const cookieStore = await cookies();

    const usuario = {
      id: data.usuario.id,
      uuid: data.usuario.uuid,
      nome: data.usuario.nome,
      email: data.usuario.email,
      codigoRfOuCpf: data.usuario.username,
      registroFuncional: data.usuario.registro_funcional,
      cpf: data.usuario.cpf,
      cargo: data.usuario.perfil_acesso.cargo,
      perfil: {
        codigo: data.usuario.perfil_acesso.perfil.codigo,
        descricao: data.usuario.perfil_acesso.perfil.descricao,
      },
      diretoriaRegional: data.usuario.diretoria_regional,
      unidadeEducacional: data.usuario.unidade_educacional,
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
