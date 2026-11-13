import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ResultadoExclusao } from "@/utils/tratarErroExclusao";

import { excluirCargo } from "../services/excluirCargo.api";

const { requisicaoAutenticadaMock, tratarErroExclusaoMock } = vi.hoisted(() => ({
  requisicaoAutenticadaMock: vi.fn(),
  tratarErroExclusaoMock: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

vi.mock("@/utils/tratarErroExclusao", () => ({
  tratarErroExclusao: tratarErroExclusaoMock,
}));

describe("excluirCargo", () => {
  const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("deve enviar a requisição de exclusão e retornar sucesso", async () => {
    requisicaoAutenticadaMock.mockResolvedValue(undefined);

    const resultado = await excluirCargo(uuid);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledTimes(1);
    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "DELETE",
      url: `cargos/${uuid}`,
    });

    expect(resultado).toEqual({ success: true });
    expect(tratarErroExclusaoMock).not.toHaveBeenCalled();
  });

  it("deve encaminhar o erro ao tratador e retornar seu resultado", async () => {
    const erroOriginal = new Error("Falha ao excluir cargo");

    const resultadoErro = {
      success: false,
      status: 500,
      title: "Erro",
      message: "Não foi possível excluir o cargo.",
    } satisfies ResultadoExclusao;

    requisicaoAutenticadaMock.mockRejectedValue(erroOriginal);
    tratarErroExclusaoMock.mockReturnValue(resultadoErro);

    const resultado = await excluirCargo(uuid);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledTimes(1);
    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "DELETE",
      url: `cargos/${uuid}`,
    });

    expect(tratarErroExclusaoMock).toHaveBeenCalledTimes(1);
    expect(tratarErroExclusaoMock).toHaveBeenCalledWith(erroOriginal, "o cargo");

    expect(resultado).toBe(resultadoErro);
  });
});
