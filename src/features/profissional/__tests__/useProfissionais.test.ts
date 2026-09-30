import { describe, expect, it, vi } from "vitest";

import { useProfissionais } from "../hooks/useProfissionais";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn((options: unknown) => options),
  listarProfissionais: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  keepPreviousData: "manter-dados-anteriores",
  useQuery: mocks.useQuery,
}));

vi.mock("../services/profissional.service", () => ({
  listarProfissionais: mocks.listarProfissionais,
}));

describe("useProfissionais", () => {
  it("configura e executa a consulta da listagem", async () => {
    const params = { nome: "João", page: 2, page_size: 10 };
    mocks.listarProfissionais.mockResolvedValueOnce({ results: [] });

    const consulta = useProfissionais(params) as unknown as {
      queryKey: unknown[];
      queryFn: () => Promise<unknown>;
      placeholderData: string;
      refetchOnWindowFocus: boolean;
    };

    expect(consulta).toMatchObject({
      queryKey: ["profissionais", params],
      placeholderData: "manter-dados-anteriores",
      refetchOnWindowFocus: false,
    });
    await expect(consulta.queryFn()).resolves.toEqual({ results: [] });
    expect(mocks.listarProfissionais).toHaveBeenCalledWith(params);
  });
});
