import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useBuscarLotePorUuid,
  useLotes,
} from "@/features/lotes/hooks/useLotes";
import type {
  LoteListParams,
  RespostaLotes,
} from "@/features/lotes/types/lotes.types";

const {
  buscarLoteActionMock,
  listarLotesActionMock,
  useQueryMock,
  keepPreviousDataMock,
} = vi.hoisted(() => ({
  buscarLoteActionMock: vi.fn(),
  listarLotesActionMock: vi.fn(),
  useQueryMock: vi.fn(),
  keepPreviousDataMock: vi.fn(),
}));

vi.mock("@/features/lotes/services/buscarLotes.api", () => ({
  buscarLoteAction: buscarLoteActionMock,
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

describe("useBuscarLotePorUuid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve configurar a consulta pelo UUID", () => {
    const resultadoUseQuery = {
      data: undefined,
      isLoading: true,
    };

    useQueryMock.mockReturnValue(resultadoUseQuery);

    const resultado = useBuscarLotePorUuid("lote-uuid-1");

    expect(useQueryMock).toHaveBeenCalledOnce();

    expect(useQueryMock).toHaveBeenCalledWith({
      queryKey: ["lote", "lote-uuid-1"],
      queryFn: expect.any(Function),
      enabled: true,
      refetchOnWindowFocus: false,
    });

    expect(resultado).toBe(resultadoUseQuery);
  });

  it("deve executar a action com o UUID informado", async () => {
    const lote = {
      uuid: "lote-uuid-1",
      codigo_cadastro: "LOTE-001",
      nome: "Lote Centro",
      status: true,
    };

    buscarLoteActionMock.mockResolvedValue(lote);
    useQueryMock.mockReturnValue({});

    useBuscarLotePorUuid("lote-uuid-1");

    const configuracao = useQueryMock.mock.calls[0][0] as {
      queryFn: () => Promise<typeof lote>;
    };

    const resultado = await configuracao.queryFn();

    expect(buscarLoteActionMock).toHaveBeenCalledOnce();
    expect(buscarLoteActionMock).toHaveBeenCalledWith("lote-uuid-1");

    expect(resultado).toBe(lote);
  });

  it("deve desabilitar a consulta quando o UUID estiver vazio", () => {
    useQueryMock.mockReturnValue({});

    useBuscarLotePorUuid("");

    expect(useQueryMock).toHaveBeenCalledWith({
      queryKey: ["lote", ""],
      queryFn: expect.any(Function),
      enabled: false,
      refetchOnWindowFocus: false,
    });
  });

  it("deve retornar exatamente o resultado do useQuery", () => {
    const resultadoEsperado = {
      data: {
        uuid: "lote-uuid-1",
      },
      isLoading: false,
      isFetching: false,
      error: null,
    };

    useQueryMock.mockReturnValue(resultadoEsperado);

    const resultado = useBuscarLotePorUuid("lote-uuid-1");

    expect(resultado).toBe(resultadoEsperado);
  });
});
