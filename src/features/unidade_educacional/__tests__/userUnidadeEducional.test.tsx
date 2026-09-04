import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUnidadeEducacional } from "@/features/unidade_educacional/hooks/useUnidadeEducacional";
import { buscarUnidadeEducaionalPorUuid } from "@/features/unidade_educacional/services/unidadeEducacional.service";
import type { UnidadeEducacional } from "@/features/unidade_educacional/types/unidadesEducacionais.types";

vi.mock(
  "@/features/unidade_educacional/services/unidadeEducacional.service",
  () => ({
    buscarUnidadeEducaionalPorUuid: vi.fn(),
  }),
);

const mockBuscarUnidadeEducaionalPorUuid = vi.mocked(
  buscarUnidadeEducaionalPorUuid,
);

const UUID = "c4e02ffc-fff5-4d36-bfca-29712e311379";

const UNIDADE_EDUCACIONAL: UnidadeEducacional = {
  id: 9466,
  uuid: UUID,
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

  it("deve chamar o serviço com o UUID informado", async () => {
    mockBuscarUnidadeEducaionalPorUuid.mockResolvedValue(
      UNIDADE_EDUCACIONAL,
    );

    renderHook(() => useUnidadeEducacional(UUID), {
      wrapper: criarWrapper(queryClient),
    });

    await waitFor(() => {
      expect(
        mockBuscarUnidadeEducaionalPorUuid,
      ).toHaveBeenCalledWith(UUID);
    });
  });

  it("deve retornar os dados após sucesso", async () => {
    mockBuscarUnidadeEducaionalPorUuid.mockResolvedValue(
      UNIDADE_EDUCACIONAL,
    );

    const { result } = renderHook(
      () => useUnidadeEducacional(UUID),
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(
        UNIDADE_EDUCACIONAL,
      );
    });

    expect(result.current.isSuccess).toBe(true);
  });

  it("deve estar pendente inicialmente", () => {
    mockBuscarUnidadeEducaionalPorUuid.mockReturnValue(
      new Promise(() => {}),
    );

    const { result } = renderHook(
      () => useUnidadeEducacional(UUID),
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    expect(result.current.isPending).toBe(true);
  });

  it("não deve chamar o serviço quando o UUID estiver vazio", () => {
    const { result } = renderHook(
      () => useUnidadeEducacional(""),
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    expect(
      mockBuscarUnidadeEducaionalPorUuid,
    ).not.toHaveBeenCalled();

    expect(result.current.fetchStatus).toBe("idle");
  });

  it("deve usar o UUID informado na queryKey", async () => {
    mockBuscarUnidadeEducaionalPorUuid.mockResolvedValue(
      UNIDADE_EDUCACIONAL,
    );

    renderHook(() => useUnidadeEducacional(UUID), {
      wrapper: criarWrapper(queryClient),
    });

    await waitFor(() => {
      expect(
        mockBuscarUnidadeEducaionalPorUuid,
      ).toHaveBeenCalledTimes(1);
    });

    const [query] = queryClient.getQueryCache().findAll();

    expect(query.queryKey).toEqual([
      "unidade",
      UUID,
    ]);
  });

  it("deve atualizar a consulta quando o UUID mudar", async () => {
    const novoUuid = "24f77957-2be7-4b6f-ad1d-a34143ecdb1e";

    mockBuscarUnidadeEducaionalPorUuid.mockResolvedValue(
      UNIDADE_EDUCACIONAL,
    );

    const { rerender } = renderHook(
      ({ uuid }: { uuid: string }) =>
        useUnidadeEducacional(uuid),
      {
        initialProps: {
          uuid: UUID,
        },
        wrapper: criarWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(
        mockBuscarUnidadeEducaionalPorUuid,
      ).toHaveBeenCalledWith(UUID);
    });

    rerender({
      uuid: novoUuid,
    });

    await waitFor(() => {
      expect(
        mockBuscarUnidadeEducaionalPorUuid,
      ).toHaveBeenCalledWith(novoUuid);
    });

    expect(
      mockBuscarUnidadeEducaionalPorUuid,
    ).toHaveBeenCalledTimes(2);
  });

  it("deve retornar erro quando o serviço falhar", async () => {
    const erro = new Error(
      "Erro ao buscar unidade educacional",
    );

    mockBuscarUnidadeEducaionalPorUuid.mockRejectedValue(
      erro,
    );

    const { result } = renderHook(
      () => useUnidadeEducacional(UUID),
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