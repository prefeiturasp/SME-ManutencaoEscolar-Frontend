import "server-only";

import axios from "axios";
import { cookies } from "next/headers";

import { api } from "@/actions/http/client";
import {
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/constants/autenticacao";

type RefreshTokenResponse = {
  access: string;
  refresh?: string;
};

export async function renovarAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return null;
  }

  try {
    const { data } = await api.post<RefreshTokenResponse>("/refresh-token/", {
      refresh: refreshToken,
    });

    cookieStore.set("accessToken", data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    if (data.refresh) {
      cookieStore.set("refreshToken", data.refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });
    }

    return data.access;
  } catch (error) {
    const refreshInvalido =
      axios.isAxiosError(error) &&
      (error.response?.status === 400 || error.response?.status === 401);

    if (refreshInvalido) {
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");

      return null;
    }

    throw error;
  }
}
