import { beforeEach, describe, expect, it, vi } from "vitest";

import { renovarAccessToken } from "@/actions/http/renovarAcessToken";

const { cookiesMock, postMock, isAxiosErrorMock, getMock, setMock, deleteMock } =
  vi.hoisted(() => ({
    cookiesMock: vi.fn(),
    postMock: vi.fn(),
    isAxiosErrorMock: vi.fn(),
    getMock: vi.fn(),
    setMock: vi.fn(),
    deleteMock: vi.fn(),
  }));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/actions/http/client", () => ({ api: { post: postMock } }));
vi.mock("axios", () => ({
  default: { isAxiosError: isAxiosErrorMock },
}));

describe("renovarAccessToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookiesMock.mockResolvedValue({
      get: getMock,
      set: setMock,
      delete: deleteMock,
    });
  });

  it("deve retornar null sem chamar a API quando não há refresh token", async () => {
    getMock.mockReturnValue(undefined);

    await expect(renovarAccessToken()).resolves.toBeNull();
    expect(postMock).not.toHaveBeenCalled();
  });

  it("deve renovar e salvar apenas o access token", async () => {
    getMock.mockReturnValue({ value: "refresh-antigo" });
    postMock.mockResolvedValue({ data: { access: "access-novo" } });

    await expect(renovarAccessToken()).resolves.toBe("access-novo");
    expect(postMock).toHaveBeenCalledWith("/refresh-token/", {
      refresh: "refresh-antigo",
    });
    expect(setMock).toHaveBeenCalledOnce();
    expect(setMock).toHaveBeenCalledWith(
      "accessToken",
      "access-novo",
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" }),
    );
  });

  it("deve salvar também o refresh token rotacionado", async () => {
    getMock.mockReturnValue({ value: "refresh-antigo" });
    postMock.mockResolvedValue({
      data: { access: "access-novo", refresh: "refresh-novo" },
    });

    await renovarAccessToken();

    expect(setMock).toHaveBeenCalledTimes(2);
    expect(setMock).toHaveBeenLastCalledWith(
      "refreshToken",
      "refresh-novo",
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" }),
    );
  });

  it.each([400, 401])(
    "deve limpar os tokens quando o refresh retorna %s",
    async (status) => {
      const erro = { response: { status } };
      getMock.mockReturnValue({ value: "refresh-invalido" });
      postMock.mockRejectedValue(erro);
      isAxiosErrorMock.mockImplementation((recebido) => recebido === erro);

      await expect(renovarAccessToken()).resolves.toBeNull();
      expect(deleteMock).toHaveBeenNthCalledWith(1, "accessToken");
      expect(deleteMock).toHaveBeenNthCalledWith(2, "refreshToken");
    },
  );

  it("deve relançar erros Axios não relacionados à autenticação", async () => {
    const erro = { response: { status: 500 } };
    getMock.mockReturnValue({ value: "refresh" });
    postMock.mockRejectedValue(erro);
    isAxiosErrorMock.mockReturnValue(true);

    await expect(renovarAccessToken()).rejects.toBe(erro);
  });

  it("deve relançar erros que não são do Axios", async () => {
    const erro = new Error("falha de rede");
    getMock.mockReturnValue({ value: "refresh" });
    postMock.mockRejectedValue(erro);
    isAxiosErrorMock.mockReturnValue(false);

    await expect(renovarAccessToken()).rejects.toBe(erro);
  });
});
