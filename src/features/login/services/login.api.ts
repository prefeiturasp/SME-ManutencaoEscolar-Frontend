"use server";

import axios from "axios";

import { api } from "@/actions/http/client";
import type {
  LoginCredentials,
  LoginResult,
  LoginUser,
} from "@/features/login/types/login.types";
import { cookies } from "next/headers";

type LoginApiResponse = {
  user: LoginUser;
  access: string;
  refresh?: string;
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

    cookieStore.set("accessToken", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 400 || status === 401) {
        return {
          success: false,
          error: "invalid-credentials",
        };
      }
    }

    return {
      success: false,
      error: "server-error",
    };
  }
}
