import { beforeEach, describe, expect, it, vi } from "vitest";

import { logout } from "../hooks/logout";

const deleteMock = vi.fn();
const cookiesMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
}));

describe("logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    cookiesMock.mockResolvedValue({
      delete: deleteMock,
    });
  });

  it("deve remover os cookies de autenticação", async () => {
    const resultado = await logout();

    expect(cookiesMock).toHaveBeenCalledTimes(1);

    expect(deleteMock).toHaveBeenCalledWith("accessToken");
    expect(deleteMock).toHaveBeenCalledWith("refreshToken");

    expect(deleteMock).toHaveBeenCalledTimes(2);

    expect(resultado).toEqual({
      success: true,
    });
  });
});
