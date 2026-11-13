import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { excluirEquipe } from "@/features/equipe/services/excluirEquipe.api";

const UUID = "equipe-123";

describe("excluirEquipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("realiza a requisição DELETE e retorna sucesso", async () => {
    requisicaoAutenticadaMock.mockResolvedValue(undefined);

    const resultado = await excluirEquipe(UUID);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledExactlyOnceWith({
      method: "DELETE",
      url: `/equipes/${UUID}/`,
    });
    expect(resultado).toEqual({ success: true });
    expect(tratarErroExclusaoMock).not.toHaveBeenCalled();
  });

  it("delega o tratamento do erro quando a exclusão falha", async () => {
    const erro = new Error("Falha ao excluir");
    const resultadoErro = {
      success: false,
      status: 400,
      title: "Não é possível excluir a equipe",
      message: "A equipe possui vínculos.",
    };
    requisicaoAutenticadaMock.mockRejectedValue(erro);
    tratarErroExclusaoMock.mockReturnValue(resultadoErro);

    const resultado = await excluirEquipe(UUID);

    expect(tratarErroExclusaoMock).toHaveBeenCalledExactlyOnceWith(erro, "a equipe");
    expect(resultado).toEqual(resultadoErro);
  });
});
