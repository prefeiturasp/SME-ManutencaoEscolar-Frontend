import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useListarServicos } from "../hooks/useListarServico";

type ConfiguracaoQuery = {
  queryKey: Array<string | number | boolean>;
  queryFn: () => Promise<unknown>;
  placeholderData: unknown;
  staleTime: number;
};

const { useQueryMock, keepPreviousDataMock, listarServicosActionMock } =
  vi.hoisted(() => ({
    useQueryMock: vi.fn((configuracao: unknown) => configuracao),
    keepPreviousDataMock: vi.fn(),
    listarServicosActionMock: vi.fn(),
  }));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
  keepPreviousData: keepPreviousDataMock,
}));

vi.mock("@/features/servico/services/buscar.api", () => ({
  listarServicosAction: listarServicosActionMock,
}));

describe("useListarServicos", () => {
  beforeEach(() => {
    useQueryMock.mockClear();
    keepPreviousDataMock.mockClear();
    listarServicosActionMock.mockReset();
  });

  it("deve configurar a query utilizando os filtros informados", async () => {
    const filtros = {
      nome: "Pintura",
      status: false,
      page: 2,
      page_size: 20,
    };

    const resposta = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          uuid: "uuid-servico-1",
          nome: "Pintura",
          status: false,
        },
      ],
    };

    listarServicosActionMock.mockResolvedValueOnce(resposta);

    renderHook(() => useListarServicos(filtros));

    expect(useQueryMock).toHaveBeenCalledTimes(1);

    const configuracao = useQueryMock.mock.calls[0][0] as ConfiguracaoQuery;

    expect(configuracao.queryKey).toEqual([
      "servicos",
      "Pintura",
      false,
      2,
      20,
    ]);

    expect(configuracao.placeholderData).toBe(keepPreviousDataMock);

    expect(configuracao.staleTime).toBe(30_000);

    await expect(configuracao.queryFn()).resolves.toEqual(resposta);

    expect(listarServicosActionMock).toHaveBeenCalledWith(filtros);
  });

  it("deve utilizar os valores padrão quando os filtros não forem informados", () => {
    const filtros = {};

    renderHook(() => useListarServicos(filtros));

    const configuracao = useQueryMock.mock.calls[0][0] as ConfiguracaoQuery;

    expect(configuracao.queryKey).toEqual(["servicos", "", "todos", 1, 10]);
  });
});
