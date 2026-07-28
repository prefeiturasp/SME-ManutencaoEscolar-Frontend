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

  it("deve usar um valor padrão quando NEXT_PUBLIC_API_URL não estiver configurada", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    const { api } = await import("../http/client");

    expect(api.defaults.baseURL).toBe("/api/v1");
  }, 10_000);
});
