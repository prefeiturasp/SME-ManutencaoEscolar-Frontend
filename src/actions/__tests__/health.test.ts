import { describe, expect, it, vi, beforeEach } from "vitest";

import { healthAction } from "../api/health";
import { api } from "@/actions/http/client";

vi.mock("@/actions/http/client", () => ({
  api: {
    get: vi.fn(),
  },
}));

describe("healthAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar o status quando data.status for string", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        status: "OK",
      },
    });

    const result = await healthAction();

    expect(api.get).toHaveBeenCalledWith("/api/v1/health/");
    expect(result).toBe("OK");
  });

  it("deve retornar JSON.stringify quando data.status não for string", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        status: {
          database: "OK",
          server: "UP",
        },
      },
    });

    const result = await healthAction();

    expect(result).toBe(
      JSON.stringify({
        database: "OK",
        server: "UP",
      })
    );
  });

  it("deve retornar JSON.stringify(data) quando data.status não existir", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        message: "API funcionando",
      },
    });

    const result = await healthAction();

    expect(result).toBe(
      JSON.stringify({
        message: "API funcionando",
      })
    );
  });

  it("deve retornar 'indisponível' quando a API der erro", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("Erro de conexão"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await healthAction();

    expect(result).toBe("indisponível");
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});