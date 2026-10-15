import { describe, expect, it, vi } from "vitest";

import { useProfissionais, useTodosProfissionais } from "../hooks/useProfissionais";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn((options: unknown) => options),
  listarProfissionais: vi.fn(),
  listarTodosProfissionais: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  keepPreviousData: "manter-dados-anteriores",
  useQuery: mocks.useQuery,
}));

vi.mock("../services/profissional.service", () => ({
  listarProfissionais: mocks.listarProfissionais,
  listarTodosProfissionais: mocks.listarTodosProfissionais,
}));

describe("useProfissionais", () => {
  it("configura e executa a consulta de todos os profissionais", async () => {
    const resposta = { results: [] };
    mocks.listarTodosProfissionais.mockResolvedValueOnce(resposta);
    const consulta = useTodosProfissionais() as unknown as {
      queryFn: () => Promise<unknown>;
    };
    expect(consulta).toMatchObject({
      queryKey: ["profissionais", "todos"],
      queryFn: mocks.listarTodosProfissionais,
      placeholderData: "manter-dados-anteriores",
      refetchOnWindowFocus: false,
    });
    await expect(consulta.queryFn()).resolves.toBe(resposta);
    expect(mocks.listarTodosProfissionais).toHaveBeenCalledWith();
  });
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
