import { beforeEach, describe, expect, it, vi } from "vitest";

import { useLotes } from "@/features/lotes/hooks/useLotes";
import type {
  LoteListParams,
  RespostaLotes,
} from "@/features/lotes/types/lotes.types";

const { listarLotesActionMock, useQueryMock, keepPreviousDataMock } =
  vi.hoisted(() => ({
    listarLotesActionMock: vi.fn(),
    useQueryMock: vi.fn(),
    keepPreviousDataMock: vi.fn(),
  }));

vi.mock("@/features/lotes/services/buscarLotes.api", () => ({
  listarLotesAction: listarLotesActionMock,
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
  keepPreviousData: keepPreviousDataMock,
}));

describe("useLotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve configurar a consulta de lotes", () => {
    const params = {
      page: 1,
      page_size: 10,
      nome: "Lote Centro",
    } as LoteListParams;

    const resultadoUseQuery = {
      data: undefined,
      isLoading: true,
    };

    useQueryMock.mockReturnValue(resultadoUseQuery);

    const resultado = useLotes(params);

    expect(useQueryMock).toHaveBeenCalledOnce();
    expect(useQueryMock).toHaveBeenCalledWith({
      queryKey: ["lotes", params],
      queryFn: expect.any(Function),
      placeholderData: keepPreviousDataMock,
      refetchOnWindowFocus: false,
    });
    expect(resultado).toBe(resultadoUseQuery);
  });

  it("deve executar a action com os parâmetros informados", async () => {
    const params: LoteListParams = {
      page: 2,
      page_size: 20,
      status: true,
    };

    const resposta = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    } as unknown as RespostaLotes;

    listarLotesActionMock.mockResolvedValue(resposta);
    useQueryMock.mockReturnValue({});

    useLotes(params);

    const configuracao = useQueryMock.mock.calls[0][0] as {
      queryFn: () => Promise<RespostaLotes>;
    };

    const resultado = await configuracao.queryFn();

    expect(listarLotesActionMock).toHaveBeenCalledOnce();
    expect(listarLotesActionMock).toHaveBeenCalledWith(params);
    expect(resultado).toBe(resposta);
  });

  it("deve manter os parâmetros na chave da consulta", () => {
    const params: LoteListParams = {
      page: 3,
      page_size: 50,
      empresa: 10,
      diretorias_regionais: "1,2",
    };

    useQueryMock.mockReturnValue({});

    useLotes(params);

    const configuracao = useQueryMock.mock.calls[0][0] as {
      queryKey: [string, LoteListParams];
    };

    expect(configuracao.queryKey).toEqual(["lotes", params]);
  });

  it("deve retornar exatamente o resultado do useQuery", () => {
    const params = {
      page: 1,
      page_size: 10,
    } as LoteListParams;

    const resultadoEsperado = {
      data: {
        count: 0,
        results: [],
      },
      isLoading: false,
      isFetching: false,
      error: null,
    };

    useQueryMock.mockReturnValue(resultadoEsperado);

    const resultado = useLotes(params);

    expect(resultado).toBe(resultadoEsperado);
  });
});
