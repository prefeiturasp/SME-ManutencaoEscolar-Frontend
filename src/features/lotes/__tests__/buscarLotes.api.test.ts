import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buscarLoteAction,
  listarLotesAction,
} from "@/features/lotes/services/buscarLotes.api";
import type {
  Lote,
  LoteListParams,
  RespostaLotes,
} from "@/features/lotes/types/lotes.types";

const { requisicaoAutenticadaMock } = vi.hoisted(() => ({
  requisicaoAutenticadaMock: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

describe("buscarLotes.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve listar os lotes utilizando os filtros informados", async () => {
    const filtros: LoteListParams = {
      page: 2,
      page_size: 20,
      nome: "Lote Centro",
      status: true,
    };

    const resposta = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          nome: "Lote Centro",
        },
      ],
    } as unknown as RespostaLotes;

    requisicaoAutenticadaMock.mockResolvedValue(resposta);

    const resultado = await listarLotesAction(filtros);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledOnce();
    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "GET",
      url: "/lotes/",
      params: filtros,
    });
    expect(resultado).toBe(resposta);
  });

  it("deve listar os lotes sem filtros", async () => {
    const resposta = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    } as unknown as RespostaLotes;

    requisicaoAutenticadaMock.mockResolvedValue(resposta);

    const resultado = await listarLotesAction();

    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "GET",
      url: "/lotes/",
      params: undefined,
    });
    expect(resultado).toBe(resposta);
  });

  it("deve buscar um lote pelo UUID", async () => {
    const lote = {
      id: 1,
      uuid: "uuid-lote-001",
      nome: "Lote Centro",
    } as unknown as Lote;

    requisicaoAutenticadaMock.mockResolvedValue(lote);

    const resultado = await buscarLoteAction("uuid-lote-001");

    expect(requisicaoAutenticadaMock).toHaveBeenCalledOnce();
    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "GET",
      url: "/lotes/uuid-lote-001/",
    });
    expect(resultado).toBe(lote);
  });

  it("deve propagar o erro ao listar os lotes", async () => {
    const erro = new Error("Erro ao listar lotes.");

    requisicaoAutenticadaMock.mockRejectedValue(erro);

    await expect(listarLotesAction()).rejects.toThrow("Erro ao listar lotes.");
  });

  it("deve propagar o erro ao buscar um lote", async () => {
    const erro = new Error("Lote não encontrado.");

    requisicaoAutenticadaMock.mockRejectedValue(erro);

    await expect(buscarLoteAction("uuid-inexistente")).rejects.toThrow(
      "Lote não encontrado.",
    );
  });
});
