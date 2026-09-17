import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useBuscarCargoPorUuid,
  useListarCargos,
} from "@/features/cargo/hooks/useListarCargo";

type ConfiguracaoQuery = {
  queryKey: Array<string | number | boolean>;
  queryFn: () => Promise<unknown>;
  placeholderData?: unknown;
  staleTime?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
};

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn((configuracao: unknown) => configuracao),
  keepPreviousData: vi.fn(),
  listarCargosAction: vi.fn(),
  buscarCargoAction: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: mocks.useQuery,
  keepPreviousData: mocks.keepPreviousData,
}));

vi.mock("../services/buscarCargo.api", () => ({
  listarCargosAction: mocks.listarCargosAction,
  buscarCargoAction: mocks.buscarCargoAction,
}));

describe("hooks de consulta de cargos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useListarCargos", () => {
    it("configura a query utilizando os filtros informados", async () => {
      const filtros = {
        nome: "Engenheiro",
        exige_documento: false,
        page: 2,
        page_size: 20,
      };

      const resposta = {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            uuid: "uuid-cargo-1",
            nome: "Engenheiro",
            exige_documento: false,
          },
        ],
      };

      mocks.listarCargosAction.mockResolvedValueOnce(resposta);

      renderHook(() => useListarCargos(filtros));

      expect(mocks.useQuery).toHaveBeenCalledTimes(1);

      const configuracao = mocks.useQuery.mock.calls[0][0] as ConfiguracaoQuery;

      expect(configuracao.queryKey).toEqual([
        "cargos",
        "Engenheiro",
        false,
        2,
        20,
      ]);
      expect(configuracao.placeholderData).toBe(mocks.keepPreviousData);
      expect(configuracao.staleTime).toBe(30_000);
      expect(configuracao.refetchOnWindowFocus).toBe(false);

      await expect(configuracao.queryFn()).resolves.toEqual(resposta);

      expect(mocks.listarCargosAction).toHaveBeenCalledTimes(1);
      expect(mocks.listarCargosAction).toHaveBeenCalledWith(filtros);
    });

    it("utiliza os valores padrão quando os filtros não são informados", async () => {
      const filtros = {};

      const resposta = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      mocks.listarCargosAction.mockResolvedValueOnce(resposta);

      renderHook(() => useListarCargos(filtros));

      const configuracao = mocks.useQuery.mock.calls[0][0] as ConfiguracaoQuery;

      expect(configuracao.queryKey).toEqual(["cargos", "", "todos", 1, 10]);

      await expect(configuracao.queryFn()).resolves.toEqual(resposta);

      expect(mocks.listarCargosAction).toHaveBeenCalledWith(filtros);
    });

    it("mantém true na chave quando o cargo exige documento", async () => {
      const filtros = {
        exige_documento: true,
      };

      const resposta = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      mocks.listarCargosAction.mockResolvedValueOnce(resposta);

      renderHook(() => useListarCargos(filtros));

      const configuracao = mocks.useQuery.mock.calls[0][0] as ConfiguracaoQuery;

      expect(configuracao.queryKey).toEqual(["cargos", "", true, 1, 10]);

      await expect(configuracao.queryFn()).resolves.toEqual(resposta);

      expect(mocks.listarCargosAction).toHaveBeenCalledWith(filtros);
    });
  });

  describe("useBuscarCargoPorUuid", () => {
    it("configura e executa a busca pelo UUID", async () => {
      const uuid = "07f14275-59ee-4e67-812a-d5aaa2cedb62";

      const cargo = {
        uuid,
        nome: "Engenheiro",
        exige_documento: true,
      };

      mocks.buscarCargoAction.mockResolvedValueOnce(cargo);

      renderHook(() => useBuscarCargoPorUuid(uuid));

      expect(mocks.useQuery).toHaveBeenCalledTimes(1);

      const configuracao = mocks.useQuery.mock.calls[0][0] as ConfiguracaoQuery;

      expect(configuracao.queryKey).toEqual(["cargo", uuid]);
      expect(configuracao.enabled).toBe(true);
      expect(configuracao.refetchOnWindowFocus).toBe(false);

      await expect(configuracao.queryFn()).resolves.toEqual(cargo);

      expect(mocks.buscarCargoAction).toHaveBeenCalledTimes(1);
      expect(mocks.buscarCargoAction).toHaveBeenCalledWith(uuid);
    });

    it("desabilita a busca quando o UUID está vazio", () => {
      renderHook(() => useBuscarCargoPorUuid(""));

      expect(mocks.useQuery).toHaveBeenCalledTimes(1);

      const configuracao = mocks.useQuery.mock.calls[0][0] as ConfiguracaoQuery;

      expect(configuracao.queryKey).toEqual(["cargo", ""]);
      expect(configuracao.enabled).toBe(false);
      expect(configuracao.refetchOnWindowFocus).toBe(false);
      expect(mocks.buscarCargoAction).not.toHaveBeenCalled();
    });
  });
});
