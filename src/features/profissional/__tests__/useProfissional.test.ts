import { describe, expect, it, vi } from "vitest";

import { useProfissional } from "../hooks/useProfissional";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn((options: unknown) => options),
  buscarProfissionalPorUuid: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({ useQuery: mocks.useQuery }));
vi.mock("../services/profissional.service", () => ({
  buscarProfissionalPorUuid: mocks.buscarProfissionalPorUuid,
}));

describe("useProfissional", () => {
  it.each([
    ["profissional-1", true],
    ["", false],
  ])("configura a consulta para o UUID %j", async (uuid, enabled) => {
    const profissional = { uuid };
    mocks.buscarProfissionalPorUuid.mockResolvedValueOnce(profissional);

    const consulta = useProfissional(uuid) as unknown as {
      queryKey: unknown[];
      queryFn: () => Promise<unknown>;
      enabled: boolean;
      refetchOnWindowFocus: boolean;
    };

    expect(consulta).toMatchObject({
      queryKey: ["profissional", uuid],
      enabled,
      refetchOnWindowFocus: false,
    });
    await expect(consulta.queryFn()).resolves.toBe(profissional);
    expect(mocks.buscarProfissionalPorUuid).toHaveBeenLastCalledWith(uuid);
  });
});
