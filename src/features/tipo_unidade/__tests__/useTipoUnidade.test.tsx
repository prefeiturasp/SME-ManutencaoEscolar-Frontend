import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useTiposUnidades,
  useTodosTiposUnidades,
} from "@/features/tipo_unidade/hooks/useTipoUnidade";
import {
  listarTiposUnidadeAction,
  listarTodasTiposUnidadeAction,
} from "@/features/tipo_unidade/service/tipoUnidade.service";
import type {
  RespostaTipoUnidade,
  TipoUnidade,
  TipoUnidadeListParams,
} from "@/features/tipo_unidade/types/tipoUnidades.types";

vi.mock(
  "@/features/tipo_unidade/service/tipoUnidade.service",
  () => ({
    listarTiposUnidadeAction: vi.fn(),
    listarTodasTiposUnidadeAction: vi.fn(),
  }),
);

const mockListarTiposUnidadeAction = vi.mocked(
  listarTiposUnidadeAction,
);

const mockListarTodasTiposUnidadeAction = vi.mocked(
  listarTodasTiposUnidadeAction,
);

const TIPO_UNIDADE: TipoUnidade = {
  id: 12,
  uuid: "c0beab6d-ba44-433f-b85e-40b51901b3e4",
  codigo_eol: "14",
  sigla: "CCI/CIPS",
};

const PARAMS: TipoUnidadeListParams = {
  sigla: "CCI/CIPS",
  page: 1,
  page_size: "10",
};

const RESPOSTA: RespostaTipoUnidade = {
  count: 1,
  next: null,
  previous: null,
  results: [TIPO_UNIDADE],
};

const TODOS_TIPOS: TipoUnidade[] = [TIPO_UNIDADE];

function criarWrapper(queryClient: QueryClient) {
  return function TestWrapper({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useTipoUnidade", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  describe("useTiposUnidades", () => {
    it("deve chamar o serviço com os parâmetros informados e retornar os dados", async () => {
      mockListarTiposUnidadeAction.mockResolvedValue(RESPOSTA);

      const { result } = renderHook(
        () => useTiposUnidades(PARAMS),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(mockListarTiposUnidadeAction).toHaveBeenCalledWith(
          PARAMS,
        );

        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(RESPOSTA);
      });
    });

    it("deve ficar pendente enquanto a requisição não resolver", () => {
      mockListarTiposUnidadeAction.mockReturnValue(
        new Promise(() => {}),
      );

      const { result } = renderHook(
        () => useTiposUnidades(PARAMS),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      expect(result.current.isPending).toBe(true);
    });

    it("deve respeitar enabled false", () => {
      const { result } = renderHook(
        () =>
          useTiposUnidades(PARAMS, {
            enabled: false,
          }),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      expect(mockListarTiposUnidadeAction).not.toHaveBeenCalled();
      expect(result.current.fetchStatus).toBe("idle");
    });

    it("deve respeitar enabled true", async () => {
      mockListarTiposUnidadeAction.mockResolvedValue(RESPOSTA);

      renderHook(
        () =>
          useTiposUnidades(PARAMS, {
            enabled: true,
          }),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(mockListarTiposUnidadeAction).toHaveBeenCalledWith(
          PARAMS,
        );
      });
    });

    it("deve retornar erro quando o serviço falhar", async () => {
      const erro = new Error("Erro ao listar tipos de unidade");

      mockListarTiposUnidadeAction.mockRejectedValue(erro);

      const { result } = renderHook(
        () => useTiposUnidades(PARAMS),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(erro);
    });

    it("deve atualizar a consulta quando os parâmetros mudarem", async () => {
      mockListarTiposUnidadeAction.mockResolvedValue(RESPOSTA);

      const { rerender } = renderHook(
        ({ params }: { params: TipoUnidadeListParams }) =>
          useTiposUnidades(params),
        {
          initialProps: {
            params: PARAMS,
          },
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(mockListarTiposUnidadeAction).toHaveBeenCalledWith(
          PARAMS,
        );
      });

      const novosParams: TipoUnidadeListParams = {
        ...PARAMS,
        sigla: "EMEF",
      };

      rerender({
        params: novosParams,
      });

      await waitFor(() => {
        expect(mockListarTiposUnidadeAction).toHaveBeenCalledWith(
          novosParams,
        );
      });

      expect(mockListarTiposUnidadeAction).toHaveBeenCalledTimes(2);
    });

    it("deve criar a queryKey com os parâmetros", () => {
      mockListarTiposUnidadeAction.mockReturnValue(
        new Promise(() => {}),
      );

      renderHook(
        () => useTiposUnidades(PARAMS),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      const queries = queryClient.getQueryCache().findAll();

      expect(queries).toHaveLength(1);
      expect(queries[0].queryKey).toEqual([
        "tipos-unidade",
        PARAMS,
      ]);
    });
  });

  describe("useTodosTiposUnidades", () => {
    it("deve chamar o serviço com os parâmetros informados e retornar os dados", async () => {
      mockListarTodasTiposUnidadeAction.mockResolvedValue(
        TODOS_TIPOS,
      );

      const { result } = renderHook(
        () => useTodosTiposUnidades(PARAMS),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(
          mockListarTodasTiposUnidadeAction,
        ).toHaveBeenCalledWith(PARAMS);

        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(TODOS_TIPOS);
      });
    });

    it("deve chamar o serviço sem parâmetros", async () => {
      mockListarTodasTiposUnidadeAction.mockResolvedValue(
        TODOS_TIPOS,
      );

      const { result } = renderHook(
        () => useTodosTiposUnidades(),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(
          mockListarTodasTiposUnidadeAction,
        ).toHaveBeenCalledWith(undefined);

        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(TODOS_TIPOS);
      });
    });

    it("deve usar undefined como valor da queryKey quando params não forem informados", () => {
      mockListarTodasTiposUnidadeAction.mockReturnValue(
        new Promise(() => {}),
      );

      renderHook(
        () => useTodosTiposUnidades(),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      const queries = queryClient.getQueryCache().findAll();

      expect(queries).toHaveLength(1);
      expect(queries[0].queryKey).toEqual([
        "tipos-unidade",
        "todos",
        undefined,
      ]);
    });

    it("deve respeitar enabled false", () => {
      const { result } = renderHook(
        () =>
          useTodosTiposUnidades(PARAMS, {
            enabled: false,
          }),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      expect(
        mockListarTodasTiposUnidadeAction,
      ).not.toHaveBeenCalled();

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("deve respeitar enabled true", async () => {
      mockListarTodasTiposUnidadeAction.mockResolvedValue(
        TODOS_TIPOS,
      );

      renderHook(
        () =>
          useTodosTiposUnidades(PARAMS, {
            enabled: true,
          }),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(
          mockListarTodasTiposUnidadeAction,
        ).toHaveBeenCalledWith(PARAMS);
      });
    });

    it("deve retornar erro quando o serviço falhar", async () => {
      const erro = new Error(
        "Erro ao listar todos os tipos de unidade",
      );

      mockListarTodasTiposUnidadeAction.mockRejectedValue(erro);

      const { result } = renderHook(
        () => useTodosTiposUnidades(),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(erro);
    });

    it("deve atualizar a consulta quando os parâmetros mudarem", async () => {
      mockListarTodasTiposUnidadeAction.mockResolvedValue(
        TODOS_TIPOS,
      );

      const { rerender } = renderHook(
        ({ params }: { params?: TipoUnidadeListParams }) =>
          useTodosTiposUnidades(params),
        {
          initialProps: {
            params: PARAMS,
          },
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(
          mockListarTodasTiposUnidadeAction,
        ).toHaveBeenCalledWith(PARAMS);
      });

      const novosParams: TipoUnidadeListParams = {
        sigla: "EMEF",
      };

      rerender({
        params: novosParams,
      });

      await waitFor(() => {
        expect(
          mockListarTodasTiposUnidadeAction,
        ).toHaveBeenCalledWith(novosParams);
      });

      expect(
        mockListarTodasTiposUnidadeAction,
      ).toHaveBeenCalledTimes(2);
    });

    it("deve criar a queryKey com params quando informados", () => {
      mockListarTodasTiposUnidadeAction.mockReturnValue(
        new Promise(() => {}),
      );

      renderHook(
        () => useTodosTiposUnidades(PARAMS),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      const queries = queryClient.getQueryCache().findAll();

      expect(queries).toHaveLength(1);
      expect(queries[0].queryKey).toEqual([
        "tipos-unidade",
        "todos",
        PARAMS,
      ]);
    });
  });
});