import { beforeEach, describe, expect, it, vi } from "vitest";

const { requisicaoAutenticadaMock, tratarErroExclusaoMock } = vi.hoisted(
  () => ({
    requisicaoAutenticadaMock: vi.fn(),
    tratarErroExclusaoMock: vi.fn(),
  }),
);

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

vi.mock("@/utils/tratarErroExclusao", () => ({
  tratarErroExclusao: tratarErroExclusaoMock,
}));

import { excluirServico } from "@/features/servico/services/excluirServico.api";

const UUID = "servico-123";

describe("excluirServico", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve realizar a requisição DELETE e retornar sucesso", async () => {
    requisicaoAutenticadaMock.mockResolvedValue(undefined);

    const resultado = await excluirServico(UUID);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledOnce();
    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "DELETE",
      url: `/servicos/${UUID}/`,
    });

    expect(resultado).toEqual({
      success: true,
    });

    expect(tratarErroExclusaoMock).not.toHaveBeenCalled();
  });

  it("deve delegar o tratamento quando ocorrer um erro", async () => {
    const error = new Error("Falha ao excluir");

    tratarErroExclusaoMock.mockReturnValue({
      success: false,
      status: 500,
      title: "Erro",
      message: "Não conseguimos excluir o serviço.",
    });

    requisicaoAutenticadaMock.mockRejectedValue(error);

    const resultado = await excluirServico(UUID);

    expect(tratarErroExclusaoMock).toHaveBeenCalledOnce();
    expect(tratarErroExclusaoMock).toHaveBeenCalledWith(error, "o serviço");

    expect(resultado).toEqual({
      success: false,
      status: 500,
      title: "Erro",
      message: "Não conseguimos excluir o serviço.",
    });
  });
});
