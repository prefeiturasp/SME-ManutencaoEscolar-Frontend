import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buscarServicoAction,
  listarServicosAction,
} from "@/features/servico/services/buscar.api";
import type {
  FiltrosServico,
  RespostaServicos,
  Servico,
} from "../types/servicos.types";

const mocks = vi.hoisted(() => ({
  requisicaoAutenticada: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: mocks.requisicaoAutenticada,
}));

const uuid = "07f14275-59ee-4e67-812a-d5aaa2cedb62";

const servico = {
  id: 1,
  uuid,
  nome: "Pintura",
  status: true,
  criado_por: 1,
  criado_por_nome: "Matheus",
  criado_em: "2026-08-12T21:21:00Z",
  atualizado_por: 2,
  atualizado_por_nome: "João",
  atualizado_em: "2026-08-13T14:02:00Z",
} as Servico;

describe("ações de consulta de serviços", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listarServicosAction", () => {
    it("deve listar os serviços com os filtros informados", async () => {
      const filtros: FiltrosServico = {
        nome: "Pintura",
        status: true,
        page: 2,
        page_size: 10,
      };

      const resposta: RespostaServicos = {
        count: 1,
        next: null,
        previous: null,
        results: [servico],
      };

      mocks.requisicaoAutenticada.mockResolvedValue(resposta);

      const resultado = await listarServicosAction(filtros);

      expect(mocks.requisicaoAutenticada).toHaveBeenCalledTimes(1);

      expect(mocks.requisicaoAutenticada).toHaveBeenCalledWith({
        method: "GET",
        url: "/servicos/",
        params: filtros,
      });

      expect(resultado).toEqual(resposta);
    });

    it("deve listar os serviços sem filtros", async () => {
      const resposta: RespostaServicos = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      mocks.requisicaoAutenticada.mockResolvedValue(resposta);

      const resultado = await listarServicosAction();

      expect(mocks.requisicaoAutenticada).toHaveBeenCalledTimes(1);

      expect(mocks.requisicaoAutenticada).toHaveBeenCalledWith({
        method: "GET",
        url: "/servicos/",
        params: undefined,
      });

      expect(resultado).toEqual(resposta);
    });

    it("deve propagar o erro da requisição de listagem", async () => {
      const error = new Error("Falha ao listar serviços");

      mocks.requisicaoAutenticada.mockRejectedValue(error);

      await expect(
        listarServicosAction({
          page: 1,
          page_size: 10,
        }),
      ).rejects.toThrow("Falha ao listar serviços");
    });
  });

  describe("buscarServicoAction", () => {
    it("deve buscar um serviço pelo UUID", async () => {
      mocks.requisicaoAutenticada.mockResolvedValue(servico);

      const resultado = await buscarServicoAction(uuid);

      expect(mocks.requisicaoAutenticada).toHaveBeenCalledTimes(1);

      expect(mocks.requisicaoAutenticada).toHaveBeenCalledWith({
        method: "GET",
        url: `/servicos/${uuid}/`,
      });

      expect(resultado).toEqual(servico);
    });

    it("deve propagar o erro da busca por UUID", async () => {
      const error = new Error("Serviço não encontrado");

      mocks.requisicaoAutenticada.mockRejectedValue(error);

      await expect(buscarServicoAction(uuid)).rejects.toThrow(
        "Serviço não encontrado",
      );

      expect(mocks.requisicaoAutenticada).toHaveBeenCalledWith({
        method: "GET",
        url: `/servicos/${uuid}/`,
      });
    });
  });
});
