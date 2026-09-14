import { beforeEach, describe, expect, it, vi } from "vitest";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { LoteFormData } from "@/features/lotes/schemas/loteSchema";
import type { ErroApi, LoteCriado } from "@/features/lotes/types/lotes.types";
import { editarLoteAction } from "../services/editarLote";

const mocks = vi.hoisted(() => ({
  isAxiosError: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    isAxiosError: mocks.isAxiosError,
  },
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: vi.fn(),
}));

const requisicaoAutenticadaMock = vi.mocked(requisicaoAutenticada);

const dadosFormulario: LoteFormData = {
  codigo_cadastro: "LOTE-001",
  nome: "Lote Teste",
  empresa: "empresa-uuid-1",
  periodo_inicial: "2026-01-01",
  periodo_final: "2026-12-31",
  status: "true",
  diretorias_regionais: ["1", "2"],
};

const loteCriado = {
  uuid: "lote-uuid-1",
  codigo_cadastro: "LOTE-001",
  nome: "Lote Teste",
  status: true,
} as unknown as LoteCriado;

type AxiosErrorMock = {
  response?: {
    data?: ErroApi;
    status?: number;
  };
};

function configurarErroAxios(data?: ErroApi, status?: number): AxiosErrorMock {
  const error: AxiosErrorMock = {
    response: {
      data,
      status,
    },
  };

  requisicaoAutenticadaMock.mockRejectedValue(error);
  mocks.isAxiosError.mockReturnValue(true);

  return error;
}

describe("editarLoteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    {
      statusFormulario: "true" as const,
      statusEsperado: true,
    },
    {
      statusFormulario: "false" as const,
      statusEsperado: false,
    },
  ])(
    "edita o lote convertendo o status $statusFormulario para $statusEsperado",
    async ({ statusFormulario, statusEsperado }) => {
      requisicaoAutenticadaMock.mockResolvedValue(loteCriado);

      const dados = {
        ...dadosFormulario,
        status: statusFormulario,
      };

      const resultado = await editarLoteAction({
        uuid: "lote-uuid-1",
        dados,
      });

      expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
        method: "PATCH",
        url: "/lotes/lote-uuid-1/",
        data: {
          nome: "Lote Teste",
          status: statusEsperado,
          codigo_cadastro: "LOTE-001",
          empresa: "empresa-uuid-1",
          periodo_inicial: "2026-01-01",
          periodo_final: "2026-12-31",
          diretorias_regionais: ["1", "2"],
        },
      });

      expect(resultado).toEqual({
        success: true,
        lote: loteCriado,
      });
    },
  );

  it("retorna a mensagem detail quando ela é uma string", async () => {
    const error = configurarErroAxios(
      {
        title: "Dados inválidos",
        detail: "Não foi possível editar o lote.",
        codigo_cadastro: [],
      },
      400,
    );

    const resultado = await editarLoteAction({
      uuid: "lote-uuid-1",
      dados: dadosFormulario,
    });

    expect(mocks.isAxiosError).toHaveBeenCalledWith(error);

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Dados inválidos",
      message: "Não foi possível editar o lote.",
      vinculados: [],
      status: 400,
    });
  });

  it("retorna a mensagem e os vínculos existentes dentro de detail", async () => {
    const vinculados = [
      ["DRE Penha", "LOTE-002"],
      ["DRE Ipiranga", "LOTE-003"],
    ];

    configurarErroAxios(
      {
        title: "Diretorias já vinculadas",
        detail: {
          message: "Existem diretorias vinculadas a outros lotes.",
          vinculados,
        },
      } as ErroApi,
      400,
    );

    const resultado = await editarLoteAction({
      uuid: "lote-uuid-1",
      dados: dadosFormulario,
    });

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Diretorias já vinculadas",
      message: "Existem diretorias vinculadas a outros lotes.",
      vinculados,
      status: 400,
    });
  });

  it.each([
    {
      descricao: "message",
      dadosErro: {
        message: "Mensagem geral da API.",
      },
      mensagemEsperada: "Mensagem geral da API.",
    },
    {
      descricao: "codigo_cadastro",
      dadosErro: {
        codigo_cadastro: ["O código de cadastro já está em uso."],
      },
      mensagemEsperada: "O código de cadastro já está em uso.",
    },
    {
      descricao: "nome",
      dadosErro: {
        nome: ["O nome é obrigatório."],
      },
      mensagemEsperada: "O nome é obrigatório.",
    },
    {
      descricao: "empresa",
      dadosErro: {
        empresa: ["A empresa informada não existe."],
      },
      mensagemEsperada: "A empresa informada não existe.",
    },
    {
      descricao: "periodo_inicial",
      dadosErro: {
        periodo_inicial: ["O período inicial é inválido."],
      },
      mensagemEsperada: "O período inicial é inválido.",
    },
    {
      descricao: "periodo_final",
      dadosErro: {
        periodo_final: ["O período final é inválido."],
      },
      mensagemEsperada: "O período final é inválido.",
    },
    {
      descricao: "diretorias_regionais",
      dadosErro: {
        diretorias_regionais: ["Selecione pelo menos uma diretoria regional."],
      },
      mensagemEsperada: "Selecione pelo menos uma diretoria regional.",
    },
    {
      descricao: "non_field_errors",
      dadosErro: {
        non_field_errors: ["Erro de validação do lote."],
      },
      mensagemEsperada: "Erro de validação do lote.",
    },
  ])(
    "retorna a mensagem presente em $descricao",
    async ({ dadosErro, mensagemEsperada }) => {
      configurarErroAxios(dadosErro as ErroApi, 400);

      const resultado = await editarLoteAction({
        uuid: "lote-uuid-1",
        dados: dadosFormulario,
      });

      expect(resultado).toEqual({
        success: false,
        error: "api-error",
        title: "Erro",
        message: mensagemEsperada,
        vinculados: [],
        status: 400,
      });
    },
  );

  it("retorna erro não identificado quando o corpo do erro está vazio", async () => {
    configurarErroAxios(
      {
        codigo_cadastro: [],
      },
      422,
    );

    const resultado = await editarLoteAction({
      uuid: "lote-uuid-1",
      dados: dadosFormulario,
    });

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Erro não identificado.",
      vinculados: [],
      status: 422,
    });
  });

  it("retorna erro não identificado quando não existem dados na resposta", async () => {
    configurarErroAxios(undefined, 500);

    const resultado = await editarLoteAction({
      uuid: "lote-uuid-1",
      dados: dadosFormulario,
    });

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Erro não identificado.",
      vinculados: [],
      status: 500,
    });
  });

  it("trata erro Axios sem response", async () => {
    const error: AxiosErrorMock = {};

    requisicaoAutenticadaMock.mockRejectedValue(error);
    mocks.isAxiosError.mockReturnValue(true);

    const resultado = await editarLoteAction({
      uuid: "lote-uuid-1",
      dados: dadosFormulario,
    });

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Erro não identificado.",
      vinculados: [],
      status: undefined,
    });
  });

  it("relança o erro quando ele não é um erro Axios", async () => {
    const error = new Error("Erro inesperado");

    requisicaoAutenticadaMock.mockRejectedValue(error);
    mocks.isAxiosError.mockReturnValue(false);

    await expect(
      editarLoteAction({
        uuid: "lote-uuid-1",
        dados: dadosFormulario,
      }),
    ).rejects.toThrow("Erro inesperado");

    expect(mocks.isAxiosError).toHaveBeenCalledWith(error);
  });
});
