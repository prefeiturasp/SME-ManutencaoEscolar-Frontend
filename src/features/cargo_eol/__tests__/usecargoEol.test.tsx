
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTodosCargosEOL } from "@/features/cargo_eol/hooks/useCargoEol";

import { listarTodosCargosEolAction } from "@/features/cargo_eol/services/cargoEol.service";
import type { CargoEol } from "@/features/cargo_eol/types/cargosEol.types";

vi.mock("@/features/cargo_eol/services/cargoEol.service", () => ({
  listarTodosCargosEolAction: vi.fn(),
}));

const mockListarTodosCargosEOLAction = vi.mocked(
  listarTodosCargosEolAction,
);

const CARGOS_EOL: CargoEol[] = [
  {
    id: 1,
    codigo: "1000",
    nome: "Diretor(a) de escola",
    perfil: "UE",
    ativo: true,
  },
  {
    id: 2,
    codigo: "2000",
    nome: "Coordenador(a) pedagógico(a)",
    perfil: "UE",
    ativo: true,
  },
];

function criarWrapper(queryClient: QueryClient) {
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useTodosCargosEOL", () => {
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

  it("deve chamar o serviço para listar todos os cargos EOL", async () => {
    mockListarTodosCargosEOLAction.mockResolvedValue(CARGOS_EOL);

    renderHook(() => useTodosCargosEOL(), {
      wrapper: criarWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockListarTodosCargosEOLAction).toHaveBeenCalledOnce();
    });
  });

  it("deve retornar os cargos EOL após sucesso", async () => {
    mockListarTodosCargosEOLAction.mockResolvedValue(CARGOS_EOL);

    const { result } = renderHook(() => useTodosCargosEOL(), {
      wrapper: criarWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(CARGOS_EOL);
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("deve ficar pendente enquanto a requisição não resolver", () => {
    mockListarTodosCargosEOLAction.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useTodosCargosEOL(), {
      wrapper: criarWrapper(queryClient),
    });

    expect(result.current.isPending).toBe(true);
  });

  it("deve retornar erro quando o serviço falhar", async () => {
    const erro = new Error("Erro ao listar cargos EOL");
    mockListarTodosCargosEOLAction.mockRejectedValue(erro);

    const { result } = renderHook(() => useTodosCargosEOL(), {
      wrapper: criarWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(erro);
  });

  it("deve utilizar a queryKey correta", () => {
    mockListarTodosCargosEOLAction.mockReturnValue(new Promise(() => {}));

    renderHook(() => useTodosCargosEOL(), {
      wrapper: criarWrapper(queryClient),
    });

    const queries = queryClient.getQueryCache().findAll();

    expect(queries).toHaveLength(1);
    expect(queries[0].queryKey).toEqual(["cargos-eol", "todos"]);
  });
});
