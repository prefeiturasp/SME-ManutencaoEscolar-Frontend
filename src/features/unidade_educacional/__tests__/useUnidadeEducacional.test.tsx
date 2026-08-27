// src/features/unidade_educacional/__tests__/hooks/useUnidadeEducacional.test.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUnidadeEducacional } from "@/features/unidade_educacional/hooks/useUnidadeEducacional";
import { listarUnidadesEducacionaisAction } from "@/features/unidade_educacional/services/unidadeEducacional.service";
import type {
  RespostaUnidadeEducacional,
  UnidadeEducacional,
  UnidadeEducacionalListParams,
} from "@/features/unidade_educacional/types/unidadesEducacionais.types";

vi.mock("@/features/unidade_educacional/services/unidadeEducacional.service", () => ({
  listarUnidadesEducacionaisAction: vi.fn(),
}));

const mockListarUnidadesEducacionaisAction = vi.mocked(
  listarUnidadesEducacionaisAction,
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

  it("deve chamar listarUnidadesEducacionaisAction com os parâmetros informados", async () => {
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

  it("deve retornar os dados das unidades após sucesso", async () => {
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
  });

  it("deve estar em estado de carregamento inicialmente", () => {
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

  it("não deve chamar o serviço quando enabled estiver como false", () => {
    renderHook(
      () =>
        useUnidadeEducacional(PARAMS, {
          enabled: false,
        }),
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    expect(mockListarUnidadesEducacionaisAction).not.toHaveBeenCalled();
  });

  it("deve chamar o serviço quando enabled estiver como true", async () => {
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

  it("deve atualizar a consulta quando os parâmetros forem alterados", async () => {
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
});