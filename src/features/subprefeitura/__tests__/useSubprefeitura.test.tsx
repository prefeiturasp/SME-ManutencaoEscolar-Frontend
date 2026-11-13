import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useSubprefeituras,
  useTodosSubprefeituras,
} from "@/features/subprefeitura/hooks/useSubprefeitura";
import {
  listarSubprefeiturasAction,
  listarTodasSubprefeiturasAction,
} from "@/features/subprefeitura/service/subprefeitura.service";
import type {
  RespostaSubprefeitura,
  Subprefeitura,
  SubprefeituraListParams,
} from "@/features/subprefeitura/types/subprefeitura.types";

vi.mock(
  "@/features/subprefeitura/service/subprefeitura.service",
  () => ({
    listarSubprefeiturasAction: vi.fn(),
    listarTodasSubprefeiturasAction: vi.fn(),
  }),
);

const mockListarSubprefeiturasAction = vi.mocked(
  listarSubprefeiturasAction,
);

const mockListarTodasSubprefeiturasAction = vi.mocked(
  listarTodasSubprefeiturasAction,
);

const SUBPREFEITURA: Subprefeitura = {
  id: 17,
  uuid: "247cf593-6089-4347-b10a-e132e30f5911",
  codigo_eol: "49",
  nome: "SE",
};

const PARAMS: SubprefeituraListParams = {
  codigo_eol: "49",
  nome: "SE",
  diretoria_regional: "DRE IPIRANGA",
  page: 1,
  page_size: "10",
};

const RESPOSTA: RespostaSubprefeitura = {
  count: 1,
  next: null,
  previous: null,
  results: [SUBPREFEITURA],
};

const TODAS_SUBPREFEITURAS: Subprefeitura[] = [SUBPREFEITURA];

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

describe("useSubprefeitura", () => {
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

  describe("useSubprefeituras", () => {
    it("deve chamar o serviço com os parâmetros informados", async () => {
      mockListarSubprefeiturasAction.mockResolvedValue(RESPOSTA);

      const { result } = renderHook(
        () => useSubprefeituras(PARAMS),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(mockListarSubprefeiturasAction).toHaveBeenCalledWith(
          PARAMS,
        );

        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(RESPOSTA);
      });
    });

    it("deve ficar pendente enquanto a requisição não resolver", () => {
      mockListarSubprefeiturasAction.mockReturnValue(
        new Promise(() => {}),
      );

      const { result } = renderHook(
        () => useSubprefeituras(PARAMS),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      expect(result.current.isPending).toBe(true);
    });

    it("deve respeitar enabled false", () => {
      const { result } = renderHook(
        () =>
          useSubprefeituras(PARAMS, {
            enabled: false,
          }),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      expect(mockListarSubprefeiturasAction).not.toHaveBeenCalled();
      expect(result.current.fetchStatus).toBe("idle");
    });

    it("deve respeitar enabled true", async () => {
      mockListarSubprefeiturasAction.mockResolvedValue(RESPOSTA);

      renderHook(
        () =>
          useSubprefeituras(PARAMS, {
            enabled: true,
          }),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(mockListarSubprefeiturasAction).toHaveBeenCalledWith(
          PARAMS,
        );
      });
    });

    it("deve retornar erro quando o serviço falhar", async () => {
      const erro = new Error("Erro ao listar subprefeituras");

      mockListarSubprefeiturasAction.mockRejectedValue(erro);

      const { result } = renderHook(
        () => useSubprefeituras(PARAMS),
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
      mockListarSubprefeiturasAction.mockResolvedValue(RESPOSTA);

      const { rerender } = renderHook(
        ({ params }: { params: SubprefeituraListParams }) =>
          useSubprefeituras(params),
        {
          initialProps: {
            params: PARAMS,
          },
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(mockListarSubprefeiturasAction).toHaveBeenCalledWith(
          PARAMS,
        );
      });

      const novosParams: SubprefeituraListParams = {
        ...PARAMS,
        codigo_eol: "50",
      };

      rerender({
        params: novosParams,
      });

      await waitFor(() => {
        expect(mockListarSubprefeiturasAction).toHaveBeenCalledWith(
          novosParams,
        );
      });

      expect(mockListarSubprefeiturasAction).toHaveBeenCalledTimes(2);
    });
  });

  describe("useTodosSubprefeituras", () => {
    it("deve chamar o serviço com a diretoria regional", async () => {
      mockListarTodasSubprefeiturasAction.mockResolvedValue(
        TODAS_SUBPREFEITURAS,
      );

      const { result } = renderHook(
        () => useTodosSubprefeituras("dre-123"),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(
          mockListarTodasSubprefeiturasAction,
        ).toHaveBeenCalledWith({
          diretoria_regional: "dre-123",
        });

        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(
          TODAS_SUBPREFEITURAS,
        );
      });
    });

    it("deve converter string vazia para undefined", async () => {
      mockListarTodasSubprefeiturasAction.mockResolvedValue(
        TODAS_SUBPREFEITURAS,
      );

      renderHook(
        () => useTodosSubprefeituras(""),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(
          mockListarTodasSubprefeiturasAction,
        ).toHaveBeenCalledWith({
          diretoria_regional: undefined,
        });
      });
    });

    it("deve usar null na queryKey quando diretoria não for informada", () => {
      mockListarTodasSubprefeiturasAction.mockReturnValue(
        new Promise(() => {}),
      );

      renderHook(
        () => useTodosSubprefeituras(),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      const queries = queryClient.getQueryCache().findAll();

      expect(queries).toHaveLength(1);
      expect(queries[0].queryKey).toEqual([
        "subprefeituras",
        "todos",
        null,
      ]);
    });

    it("deve usar a diretoria regional na queryKey", async () => {
      mockListarTodasSubprefeiturasAction.mockResolvedValue(
        TODAS_SUBPREFEITURAS,
      );

      renderHook(
        () => useTodosSubprefeituras("dre-123"),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(
          mockListarTodasSubprefeiturasAction,
        ).toHaveBeenCalledTimes(1);
      });

      const queries = queryClient.getQueryCache().findAll();

      expect(queries[0].queryKey).toEqual([
        "subprefeituras",
        "todos",
        "dre-123",
      ]);
    });

    it("deve respeitar enabled false", () => {
      const { result } = renderHook(
        () =>
          useTodosSubprefeituras(undefined, {
            enabled: false,
          }),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      expect(
        mockListarTodasSubprefeiturasAction,
      ).not.toHaveBeenCalled();

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("deve respeitar enabled true", async () => {
      mockListarTodasSubprefeiturasAction.mockResolvedValue(
        TODAS_SUBPREFEITURAS,
      );

      renderHook(
        () =>
          useTodosSubprefeituras(undefined, {
            enabled: true,
          }),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(
          mockListarTodasSubprefeiturasAction,
        ).toHaveBeenCalledWith({
          diretoria_regional: undefined,
        });
      });
    });

    it("deve retornar erro quando listar todas falhar", async () => {
      const erro = new Error(
        "Erro ao listar todas as subprefeituras",
      );

      mockListarTodasSubprefeiturasAction.mockRejectedValue(erro);

      const { result } = renderHook(
        () => useTodosSubprefeituras(),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(erro);
    });

    it("deve atualizar a consulta quando a diretoria mudar", async () => {
      mockListarTodasSubprefeiturasAction.mockResolvedValue(
        TODAS_SUBPREFEITURAS,
      );

      const { rerender } = renderHook(
        ({ diretoriaRegionalId }: { diretoriaRegionalId?: string }) =>
          useTodosSubprefeituras(diretoriaRegionalId),
        {
          initialProps: {
            diretoriaRegionalId: "dre-123",
          },
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(
          mockListarTodasSubprefeiturasAction,
        ).toHaveBeenCalledWith({
          diretoria_regional: "dre-123",
        });
      });

      rerender({
        diretoriaRegionalId: "dre-456",
      });

      await waitFor(() => {
        expect(
          mockListarTodasSubprefeiturasAction,
        ).toHaveBeenCalledWith({
          diretoria_regional: "dre-456",
        });
      });

      expect(
        mockListarTodasSubprefeiturasAction,
      ).toHaveBeenCalledTimes(2);
    });
  });
});