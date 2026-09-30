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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exclui o cargo e retorna sucesso", async () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    requisicaoAutenticadaMock.mockResolvedValue(undefined);

    const resultado = await excluirCargo(uuid);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledTimes(1);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "DELETE",
      url: `cargos/${uuid}`,
    });

    expect(resultado).toEqual({
      success: true,
    });

    expect(tratarErroExclusaoMock).not.toHaveBeenCalled();
  });

  it("trata o erro ocorrido durante a exclusão", async () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    const erroOriginal = new Error("Falha ao excluir cargo");

    const resultadoErro = {
      success: false,
      status: 500,
      title: "Erro",
      message: "Não foi possível excluir o cargo.",
    } as ResultadoExclusao;

    requisicaoAutenticadaMock.mockRejectedValue(erroOriginal);

    tratarErroExclusaoMock.mockReturnValue(resultadoErro);

    const resultado = await excluirCargo(uuid);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "DELETE",
      url: `cargos/${uuid}`,
    });

    expect(tratarErroExclusaoMock).toHaveBeenCalledTimes(1);

    expect(tratarErroExclusaoMock).toHaveBeenCalledWith(erroOriginal, "o cargo");

    expect(resultado).toEqual(resultadoErro);
  });
});
