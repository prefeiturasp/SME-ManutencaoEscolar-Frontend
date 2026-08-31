import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTodasUnidadesEducacionais, useUnidadeEducacional } from "@/features/unidade_educacional/hooks/useUnidadeEducacional";
import { listarTodasUnidadesEducacionaisAction, listarUnidadesEducacionaisAction } from "@/features/unidade_educacional/services/unidadeEducacional.service";
import type {
  RespostaUnidadeEducacional,
  UnidadeEducacional,
  UnidadeEducacionalListParams,
} from "@/features/unidade_educacional/types/unidadesEducacionais.types";

vi.mock("@/features/unidade_educacional/services/unidadeEducacional.service", () => ({
  listarUnidadesEducacionaisAction: vi.fn(),
  listarTodasUnidadesEducacionaisAction: vi.fn(),
}));

const mockListarUnidadesEducacionaisAction = vi.mocked(
  listarUnidadesEducacionaisAction,
);

const mockListarTodasUnidadesEducacionaisAction = vi.mocked(
  listarTodasUnidadesEducacionaisAction,
);

const UNIDADE_ATIVA: UnidadeEducacional = {
  id: 9466,
  uuid: "c4e02ffc-fff5-4d36-bfca-29712e311379",
  codigo_eol: "400509",
  nome: "CCI/CIPS CAMARA MUNICIPAL DE SAO PAULO",
  diretoria_regional: {
    id: 6,
    codigo: "108600",
    nome: "DIRETORIA REGIONAL DE EDUCACAO IPIRANGA",
    abreviacao: "DRE - IP",
    nome_curto: "DRE IPIRANGA",
  },
  tipo_escola: {
    id: 12,
    uuid: "c0beab6d-ba44-433f-b85e-40b51901b3e4",
    codigo_eol: 14,
    sigla: "CCI/CIPS",
  },
  subprefeitura: {
    id: 17,
    uuid: "247cf593-6089-4347-b10a-e132e30f5911",
    codigo_eol: "49",
    nome: "SE",
  },
  lote: {
    id: 1,
    uuid: "2809f4cc-5b20-471d-8bea-1ed8148640c8",
    codigo: "010203",
    nome: "Lote 2025/2027",
  },
  status: true,
};

const PARAMS: UnidadeEducacionalListParams = {
  codigo_eol: "400509",
  page: 1,
  page_size: "10",
};

const RESPOSTA: RespostaUnidadeEducacional = {
  results: [UNIDADE_ATIVA],
  count: 1,
  next: null,
  previous: null,
};

const TODAS_UNIDADES: UnidadeEducacional[] = [UNIDADE_ATIVA];

function criarWrapper(queryClient: QueryClient) {
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useUnidadeEducacional", () => {
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

  describe("useUnidadeEducacional", () => {
    it("deve chamar o serviço com os parâmetros informados", async () => {
      mockListarUnidadesEducacionaisAction.mockResolvedValue(RESPOSTA);

      renderHook(() => useUnidadeEducacional(PARAMS), {
        wrapper: criarWrapper(queryClient),
      });

      await waitFor(() => {
        expect(mockListarUnidadesEducacionaisAction).toHaveBeenCalledWith(
          PARAMS,
        );
      });
    });

    it("deve retornar os dados após sucesso", async () => {
      mockListarUnidadesEducacionaisAction.mockResolvedValue(RESPOSTA);

      const { result } = renderHook(
        () => useUnidadeEducacional(PARAMS),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(RESPOSTA);
      });

      expect(result.current.isSuccess).toBe(true);
    });

    it("deve estar pendente inicialmente", () => {
      mockListarUnidadesEducacionaisAction.mockReturnValue(
        new Promise(() => {}),
      );

      const { result } = renderHook(
        () => useUnidadeEducacional(PARAMS),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      expect(result.current.isPending).toBe(true);
    });

    it("deve usar enabled como false", () => {
      const { result } = renderHook(
        () =>
          useUnidadeEducacional(PARAMS, {
            enabled: false,
          }),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      expect(mockListarUnidadesEducacionaisAction).not.toHaveBeenCalled();
      expect(result.current.fetchStatus).toBe("idle");
    });

    it("deve usar enabled como true", async () => {
      mockListarUnidadesEducacionaisAction.mockResolvedValue(RESPOSTA);

      renderHook(
        () =>
          useUnidadeEducacional(PARAMS, {
            enabled: true,
          }),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(mockListarUnidadesEducacionaisAction).toHaveBeenCalledWith(
          PARAMS,
        );
      });
    });

    it("deve atualizar a consulta quando os parâmetros mudarem", async () => {
      mockListarUnidadesEducacionaisAction.mockResolvedValue(RESPOSTA);

      const { rerender } = renderHook(
        ({ params }: { params: UnidadeEducacionalListParams }) =>
          useUnidadeEducacional(params),
        {
          initialProps: {
            params: PARAMS,
          },
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(mockListarUnidadesEducacionaisAction).toHaveBeenCalledWith(
          PARAMS,
        );
      });

      const novosParams: UnidadeEducacionalListParams = {
        ...PARAMS,
        codigo_eol: "400501",
      };

      rerender({ params: novosParams });

      await waitFor(() => {
        expect(mockListarUnidadesEducacionaisAction).toHaveBeenCalledWith(
          novosParams,
        );
      });
    });

    it("deve retornar erro quando o serviço falhar", async () => {
      const erro = new Error("Erro ao listar unidades educacionais");

      mockListarUnidadesEducacionaisAction.mockRejectedValue(erro);

      const { result } = renderHook(
        () => useUnidadeEducacional(PARAMS),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(erro);
    });
  });

  describe("useTodasUnidadesEducacionais", () => {
    it("deve chamar o serviço com todos os filtros informados", async () => {
  mockListarTodasUnidadesEducacionaisAction.mockResolvedValue(
    TODAS_UNIDADES,
  );

    const { result } = renderHook(
      () =>
        useTodasUnidadesEducacionais({
        diretoria_regional: "dre-123",
        tipo_escola: "tipo-456",
        subprefeitura: "sub-789",
      }),
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(
        mockListarTodasUnidadesEducacionaisAction,
      ).toHaveBeenCalledWith({
        diretoria_regional: "dre-123",
        tipo_escola: "tipo-456",
        subprefeitura: "sub-789",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(TODAS_UNIDADES);
    });
  });

  it("deve usar objeto vazio quando os filtros não forem informados", async () => {
    mockListarTodasUnidadesEducacionaisAction.mockResolvedValue(
      TODAS_UNIDADES,
    );

    const { result } = renderHook(
      () => useTodasUnidadesEducacionais(),
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(
        mockListarTodasUnidadesEducacionaisAction,
      ).toHaveBeenCalledWith({});
    });

     await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(TODAS_UNIDADES);
  });
  });

    it("deve usar objeto vazio  na queryKey quando os filtros não forem informados", () => {
      mockListarTodasUnidadesEducacionaisAction.mockReturnValue(
      new Promise(() => {}),
      );

      const { result } = renderHook(
        () => useTodasUnidadesEducacionais(),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      expect(result.current.isPending).toBe(true);

      const [query] = queryClient.getQueryCache().findAll();

      expect(query.queryKey).toEqual([
        "unidades",
        "todas",
        {},
      ]);
    });

    it("deve usar os valores informados na queryKey", async () => {
      mockListarTodasUnidadesEducacionaisAction.mockResolvedValue(
        TODAS_UNIDADES,
      );

      const filtros: UnidadeEducacionalListParams = {
      diretoria_regional: "dre-123",
      tipo_escola: "tipo-456",
      subprefeitura: "subprefeitura-789",
    };

    renderHook(
      () => useTodasUnidadesEducacionais(filtros),
      {
        wrapper: criarWrapper(queryClient),
      },
    );

      await waitFor(() => {
        expect(
          mockListarTodasUnidadesEducacionaisAction,
        ).toHaveBeenCalledTimes(1);
      });

      expect(queryClient.getQueryCache().findAll()).toHaveLength(1);

      const [query] = queryClient.getQueryCache().findAll();

      expect(query.queryKey).toEqual([
         "unidades",
        "todas",
        filtros,
      ]);
    });

    it("deve respeitar enabled false", () => {
      const { result } = renderHook(
        () =>
          useTodasUnidadesEducacionais(
           {},
            {
              enabled: false,
            },
          ),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      expect(
        mockListarTodasUnidadesEducacionaisAction,
      ).not.toHaveBeenCalled();

      expect(result.current.fetchStatus).toBe("idle");
    });

    it("deve respeitar enabled true", async () => {
      mockListarTodasUnidadesEducacionaisAction.mockResolvedValue(
        TODAS_UNIDADES,
      );
      const filtros: UnidadeEducacionalListParams = {};
      renderHook(
        () =>
          useTodasUnidadesEducacionais(
           filtros,
            {
              enabled: true,
            },
          ),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(
          mockListarTodasUnidadesEducacionaisAction,
        ).toHaveBeenCalledWith(filtros);
      });
    });

    it("deve retornar erro quando listar todas falhar", async () => {
      const erro = new Error(
        "Erro ao listar todas as unidades educacionais",
      );

      mockListarTodasUnidadesEducacionaisAction.mockRejectedValue(erro);

      const { result } = renderHook(
        () => useTodasUnidadesEducacionais(),
        {
          wrapper: criarWrapper(queryClient),
        },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(erro);
    });

    it("deve atualizar a consulta quando os filtros mudarem", async () => {
      mockListarTodasUnidadesEducacionaisAction.mockResolvedValue(
        TODAS_UNIDADES,
      );

      const { rerender } = renderHook(
      ({
        filtros,
      }: {
        filtros: UnidadeEducacionalListParams;
      }) => useTodasUnidadesEducacionais(filtros),
      {
        initialProps: {
          filtros: {
            diretoria_regional: "dre-123",
            tipo_escola: "tipo-456",
            subprefeitura: "sub-789",
          },
        },
        wrapper: criarWrapper(queryClient),
      },
    );

      await waitFor(() => {
      expect(
        mockListarTodasUnidadesEducacionaisAction,
      ).toHaveBeenCalledWith({
        diretoria_regional: "dre-123",
        tipo_escola: "tipo-456",
        subprefeitura: "sub-789",
      });
    });

       const novosFiltros = {
        diretoria_regional: "dre-999",
        tipo_escola: "tipo-888",
        subprefeitura: "sub-777",
      };

      rerender({
        filtros: novosFiltros,
      });

      await waitFor(() => {
        expect(
          mockListarTodasUnidadesEducacionaisAction,
        ).toHaveBeenCalledWith(novosFiltros);
      });

      expect(
        mockListarTodasUnidadesEducacionaisAction,
      ).toHaveBeenCalledTimes(2);
    });
  });
});