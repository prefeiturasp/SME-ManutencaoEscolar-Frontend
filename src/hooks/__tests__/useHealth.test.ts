import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useHealth } from "../useHealth";
import { healthAction } from "@/actions/api/health";

vi.mock("@/actions/api/health", () => ({
  healthAction: vi.fn(),
}));

describe("useHealth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve iniciar com 'Carregando...'", () => {
    vi.mocked(healthAction).mockResolvedValue("OK");

    const { result } = renderHook(() => useHealth());

    expect(result.current).toBe("Carregando...");
  });

  it("deve chamar healthAction ao montar", async () => {
    vi.mocked(healthAction).mockResolvedValue("OK");

    renderHook(() => useHealth());

    await waitFor(() => {
      expect(healthAction).toHaveBeenCalledTimes(1);
    });
  });

  it("deve atualizar o status quando a action retornar", async () => {
    vi.mocked(healthAction).mockResolvedValue("API saudável");

    const { result } = renderHook(() => useHealth());

    await waitFor(() => {
      expect(result.current).toBe("API saudável");
    });
  });
});