import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useBuscarServicoPorUuid,
  useListarServicos,
} from "../hooks/useListarServico";

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
  listarServicosAction: vi.fn(),
  buscarServicoAction: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: mocks.useQuery,
  keepPreviousData: mocks.keepPreviousData,
}));

vi.mock("@/features/servico/services/buscar.api", () => ({
  listarServicosAction: mocks.listarServicosAction,
  buscarServicoAction: mocks.buscarServicoAction,
}));

describe("hooks de consulta de serviços", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useListarServicos", () => {
    it("deve configurar a query utilizando os filtros informados", async () => {
      const filtros = {
        nome: "Pintura",
        status: false,
        page: 2,
        page_size: 20,
      };

      const resposta = {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            uuid: "uuid-servico-1",
            nome: "Pintura",
            status: false,
          },
        ],
      };

      mocks.listarServicosAction.mockResolvedValueOnce(resposta);

      renderHook(() => useListarServicos(filtros));

      expect(mocks.useQuery).toHaveBeenCalledTimes(1);

      const configuracao = mocks.useQuery.mock.calls[0][0] as ConfiguracaoQuery;

      expect(configuracao.queryKey).toEqual([
        "servicos",
        "Pintura",
        false,
        2,
        20,
      ]);

      expect(configuracao.placeholderData).toBe(mocks.keepPreviousData);

      expect(configuracao.staleTime).toBe(30_000);

      await expect(configuracao.queryFn()).resolves.toEqual(resposta);

      expect(mocks.listarServicosAction).toHaveBeenCalledTimes(1);

      expect(mocks.listarServicosAction).toHaveBeenCalledWith(filtros);
    });

    it("deve utilizar os valores padrão quando os filtros não forem informados", async () => {
      const filtros = {};

      const resposta = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      mocks.listarServicosAction.mockResolvedValueOnce(resposta);

      renderHook(() => useListarServicos(filtros));

      const configuracao = mocks.useQuery.mock.calls[0][0] as ConfiguracaoQuery;

      expect(configuracao.queryKey).toEqual(["servicos", "", "todos", 1, 10]);

      await expect(configuracao.queryFn()).resolves.toEqual(resposta);

      expect(mocks.listarServicosAction).toHaveBeenCalledWith(filtros);
    });
  });

  describe("useBuscarServicoPorUuid", () => {
    it("deve configurar e executar a busca pelo UUID", async () => {
      const uuid = "07f14275-59ee-4e67-812a-d5aaa2cedb62";

      const servico = {
        id: 1,
        uuid,
        nome: "Pintura",
        status: true,
      };

      mocks.buscarServicoAction.mockResolvedValueOnce(servico);

      renderHook(() => useBuscarServicoPorUuid(uuid));

      expect(mocks.useQuery).toHaveBeenCalledTimes(1);

      const configuracao = mocks.useQuery.mock.calls[0][0] as ConfiguracaoQuery;

      expect(configuracao.queryKey).toEqual(["servico", uuid]);

      expect(configuracao.enabled).toBe(true);

      expect(configuracao.refetchOnWindowFocus).toBe(false);

      await expect(configuracao.queryFn()).resolves.toEqual(servico);

      expect(mocks.buscarServicoAction).toHaveBeenCalledTimes(1);

      expect(mocks.buscarServicoAction).toHaveBeenCalledWith(uuid);
    });

    it("deve desabilitar a busca quando o UUID estiver vazio", () => {
      renderHook(() => useBuscarServicoPorUuid(""));

      expect(mocks.useQuery).toHaveBeenCalledTimes(1);

      const configuracao = mocks.useQuery.mock.calls[0][0] as ConfiguracaoQuery;

      expect(configuracao.queryKey).toEqual(["servico", ""]);

      expect(configuracao.enabled).toBe(false);

      expect(configuracao.refetchOnWindowFocus).toBe(false);

      expect(mocks.buscarServicoAction).not.toHaveBeenCalled();
    });
  });
});
