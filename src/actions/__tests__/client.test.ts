import { describe, expect, it, vi, beforeEach } from "vitest";

describe("client.ts", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("deve criar a instância do axios com a URL configurada", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8002";

    const { api } = await import("../http/client");

    expect(api.defaults.baseURL).toBe("http://localhost:8002/api/v1");
    expect(api.defaults.headers["Content-Type"]).toBe("application/json");
  }, 10_000);

  it("deve lançar erro quando NEXT_PUBLIC_API_URL não estiver configurada", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    await expect(import("../http/client")).rejects.toThrow(
      "A variável NEXT_PUBLIC_API_URL não foi configurada.",
    );
  }, 10_000);
});
