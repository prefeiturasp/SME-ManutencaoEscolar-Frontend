import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import { useEmpresas } from "@/features/empresa/hooks/useEmpresas";

import { useOpcoesLote } from "../hooks/useOpcoesLote";

vi.mock("@/features/diretoria_regional/hooks/useDiretoriaRegional", () => ({
  useListarDiretoriasRegionais: vi.fn(),
}));

vi.mock("@/features/empresa/hooks/useEmpresas", () => ({
  useEmpresas: vi.fn(),
}));

const mockUseEmpresas = vi.mocked(useEmpresas);
const mockUseListarDiretoriasRegionais = vi.mocked(
  useListarDiretoriasRegionais,
);

describe("useOpcoesLote", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseEmpresas.mockReturnValue({
      data: undefined,
    } as never);

    mockUseListarDiretoriasRegionais.mockReturnValue({
      data: undefined,
    } as never);
  });

  it("deve buscar todas as empresas e transformar uma resposta em array", () => {
    mockUseEmpresas.mockReturnValue({
      data: [
        {
          uuid: "uuid-empresa-1",
          nome: "Empresa 1",
        },
        {
          uuid: "uuid-empresa-2",
          nome: "Empresa 2",
        },
      ],
    } as never);

    const { result } = renderHook(() => useOpcoesLote());

    expect(mockUseEmpresas).toHaveBeenCalledTimes(1);
    expect(mockUseEmpresas).toHaveBeenCalledWith({
      page_size: "all",
    });

    expect(result.current.empresasOpcoes).toEqual([
      {
        label: "Empresa 1",
        value: "uuid-empresa-1",
      },
      {
        label: "Empresa 2",
        value: "uuid-empresa-2",
      },
    ]);

    expect(result.current.diretoriasRegionaisOpcoes).toEqual([]);
  });

  it("deve transformar empresas paginadas e diretorias em opções", () => {
    mockUseEmpresas.mockReturnValue({
      data: {
        results: [
          {
            uuid: "uuid-empresa-paginada",
            nome: "Empresa paginada",
          },
        ],
      },
    } as never);

    mockUseListarDiretoriasRegionais.mockReturnValue({
      data: {
        results: [
          {
            id: 10,
            nome: "Diretoria Regional Completa",
            nome_curto: "DRE Curta",
          },
          {
            id: 20,
            nome: "Diretoria Regional Sem Abreviação",
            nome_curto: "",
          },
        ],
      },
    } as never);

    const { result } = renderHook(() => useOpcoesLote());

    expect(mockUseListarDiretoriasRegionais).toHaveBeenCalledTimes(1);

    expect(result.current.empresasOpcoes).toEqual([
      {
        label: "Empresa paginada",
        value: "uuid-empresa-paginada",
      },
    ]);

    expect(result.current.diretoriasRegionaisOpcoes).toEqual([
      {
        label: "DRE Curta",
        value: "10",
      },
      {
        label: "Diretoria Regional Sem Abreviação",
        value: "20",
      },
    ]);
  });

  it("deve retornar listas vazias quando os hooks não retornarem dados", () => {
    const { result } = renderHook(() => useOpcoesLote());

    expect(result.current).toEqual({
      empresasOpcoes: [],
      diretoriasRegionaisOpcoes: [],
    });
  });
});
