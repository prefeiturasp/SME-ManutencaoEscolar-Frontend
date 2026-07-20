import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { proxy } from "@/proxy";

vi.mock("next/server", () => ({
  NextResponse: {
    redirect: vi.fn(),
    next: vi.fn(),
  },
}));

const redirectMock = vi.mocked(NextResponse.redirect);
const nextMock = vi.mocked(NextResponse.next);

function createRequest({
  pathname,
  token,
}: {
  pathname: string;
  token?: string;
}) {
  return {
    nextUrl: {
      pathname,
    },
    url: `http://localhost:3000${pathname}`,
    cookies: {
      get: vi.fn().mockReturnValue(
        token
          ? {
              value: token,
            }
          : undefined,
      ),
    },
  } as unknown as NextRequest;
}

describe("proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve redirecionar para login quando não houver token em rota privada", () => {
    const request = createRequest({
      pathname: "/dashboard",
    });

    proxy(request);

    expect(redirectMock).toHaveBeenCalledWith(
      new URL("http://localhost:3000/login"),
    );

    expect(nextMock).not.toHaveBeenCalled();
  });

  it("deve permitir acesso à rota de login sem token", () => {
    const request = createRequest({
      pathname: "/login",
    });

    proxy(request);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("deve permitir acesso a uma subrota pública sem token", () => {
    const request = createRequest({
      pathname: "/recuperar-senha/token-123",
    });

    proxy(request);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("deve redirecionar para dashboard quando houver token na rota de login", () => {
    const request = createRequest({
      pathname: "/login",
      token: "access-token",
    });

    proxy(request);

    expect(redirectMock).toHaveBeenCalledWith(
      new URL("http://localhost:3000/dashboard"),
    );

    expect(nextMock).not.toHaveBeenCalled();
  });

  it("deve redirecionar para dashboard quando houver token em subrota pública", () => {
    const request = createRequest({
      pathname: "/recuperar-senha/token-123",
      token: "access-token",
    });

    proxy(request);

    expect(redirectMock).toHaveBeenCalledWith(
      new URL("http://localhost:3000/dashboard"),
    );

    expect(nextMock).not.toHaveBeenCalled();
  });

  it("deve permitir acesso à rota privada quando houver token", () => {
    const request = createRequest({
      pathname: "/dashboard",
      token: "access-token",
    });

    proxy(request);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
