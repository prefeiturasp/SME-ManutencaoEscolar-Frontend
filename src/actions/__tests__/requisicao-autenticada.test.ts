import { beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";

const { get, request, renovar } = vi.hoisted(() => ({
  get: vi.fn(), request: vi.fn(), renovar: vi.fn(),
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get }) }));
vi.mock("@/actions/http/client", () => ({ api: { request } }));
vi.mock("@/actions/http/renovarAcessToken", () => ({ renovarAccessToken: renovar }));
import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";

const configuracao = { url: "/empresas", headers: { "X-Test": "preservado" } };

describe("requisicaoAutenticada", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    get.mockReturnValue({ value: "atual" });
    request.mockResolvedValue({ data: { ok: true } });
  });

  it("envia o token do cookie e preserva a configuração", async () => {
    await expect(requisicaoAutenticada(configuracao)).resolves.toEqual({ ok: true });
    expect(get).toHaveBeenCalledWith("accessToken");
    expect(request).toHaveBeenCalledWith({ ...configuracao, headers: { "X-Test": "preservado", Authorization: "Bearer atual" } });
    expect(renovar).not.toHaveBeenCalled();
  });

  it.each([undefined, { value: "" }])("renova quando o cookie é %s", async (cookie) => {
    get.mockReturnValue(cookie);
    renovar.mockResolvedValue("novo");
    await expect(requisicaoAutenticada({ url: "/empresas" })).resolves.toEqual({ ok: true });
    expect(request).toHaveBeenCalledWith({ url: "/empresas", headers: { Authorization: "Bearer novo" } });
  });

  it("encerra a sessão se não houver token nem renovação", async () => {
    get.mockReturnValue(undefined);
    renovar.mockResolvedValue(null);
    await expect(requisicaoAutenticada(configuracao)).rejects.toThrow("Sessão expirada. Faça login novamente.");
    expect(request).not.toHaveBeenCalled();
  });

  it.each([new Error("rede"), new AxiosError("rede"), { isAxiosError: true, response: { status: 500 } }])("propaga erros diferentes de 401", async (error) => {
    request.mockRejectedValue(error);
    await expect(requisicaoAutenticada(configuracao)).rejects.toBe(error);
    expect(renovar).not.toHaveBeenCalled();
  });

  it("repete uma requisição não autorizada com o token renovado", async () => {
    request.mockRejectedValueOnce({ isAxiosError: true, response: { status: 401 } });
    renovar.mockResolvedValue("novo");
    await expect(requisicaoAutenticada(configuracao)).resolves.toEqual({ ok: true });
    expect(request).toHaveBeenCalledTimes(2);
    expect(request).toHaveBeenLastCalledWith({ ...configuracao, headers: { "X-Test": "preservado", Authorization: "Bearer novo" } });
  });

  it("encerra a sessão quando a renovação após 401 falha", async () => {
    request.mockRejectedValueOnce({ isAxiosError: true, response: { status: 401 } });
    renovar.mockResolvedValue(null);
    await expect(requisicaoAutenticada(configuracao)).rejects.toThrow("Sessão expirada. Faça login novamente.");
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("propaga o erro da segunda tentativa sem repetir indefinidamente", async () => {
    const error = { isAxiosError: true, response: { status: 401 } };
    request.mockRejectedValue(error);
    renovar.mockResolvedValue("novo");
    await expect(requisicaoAutenticada(configuracao)).rejects.toBe(error);
    expect(request).toHaveBeenCalledTimes(2);
    expect(renovar).toHaveBeenCalledTimes(1);
  });
});
