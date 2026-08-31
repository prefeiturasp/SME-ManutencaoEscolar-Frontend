import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LoteFormData } from "@/features/lotes/schemas/loteSchema";
import type {
  CriarLoteResultado,
  DreVinculada,
  LoteCriado,
} from "@/features/lotes/types/lotes.types";

import { criarLoteAction } from "@/features/lotes/services/criarLote.api";

const { requisicaoAutenticadaMock, isAxiosErrorMock } = vi.hoisted(() => ({
  requisicaoAutenticadaMock: vi.fn(),
  isAxiosErrorMock: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

vi.mock("axios", () => ({
  default: {
    isAxiosError: isAxiosErrorMock,
  },
}));

type DadosErroTeste = {
  title?: string;
  detail?:
    | string
    | {
        message?: string;
        vinculados?: DreVinculada[];
      };
  message?: string;
  codigo_cadastro?: string[];
  nome?: string[];
  empresa?: string[];
  periodo_inicial?: string[];
  periodo_final?: string[];
  diretorias_regionais?: string[];
  non_field_errors?: string[];
};

const dadosValidos: LoteFormData = {
  codigo_cadastro: "  LOTE-001  ",
  nome: "  Lote de manutenção  ",
  empresa: "empresa-uuid",
  periodo_inicial: "2026-08-01",
  periodo_final: "2026-08-31",
  status: "true",
  diretorias_regionais: ["1", "2", "15"],
};

const loteCriado = {
  id: 1,
  uuid: "lote-uuid",
  codigo_cadastro: "LOTE-001",
  nome: "Lote de manutenção",
  empresa: "empresa-uuid",
  periodo_inicial: "2026-08-01",
  periodo_final: "2026-08-31",
  status: true,
  diretorias_regionais: [1, 2, 15],
} as LoteCriado;

async function executarComErroApi(
  dadosErro: DadosErroTeste | undefined,
  status = 400,
): Promise<CriarLoteResultado> {
  const error = dadosErro
    ? {
        response: {
          data: dadosErro,
          status,
        },
      }
    : {
        response: {
          status,
        },
      };

  isAxiosErrorMock.mockReturnValue(true);
  requisicaoAutenticadaMock.mockRejectedValue(error);

  return criarLoteAction(dadosValidos);
}

describe("criarLoteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAxiosErrorMock.mockReturnValue(false);
  });

  it("cria o lote com os dados normalizados", async () => {
    requisicaoAutenticadaMock.mockResolvedValue(loteCriado);

    const resultado = await criarLoteAction(dadosValidos);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledTimes(1);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "POST",
      url: "/lotes/",
      data: {
        codigo_cadastro: "LOTE-001",
        nome: "Lote de manutenção",
        empresa: "empresa-uuid",
        periodo_inicial: "2026-08-01",
        periodo_final: "2026-08-31",
        status: true,
        diretorias_regionais: [1, 2, 15],
      },
    });

    expect(resultado).toEqual({
      success: true,
      lote: loteCriado,
    });
  });

  it("converte o status false para booleano", async () => {
    requisicaoAutenticadaMock.mockResolvedValue({
      ...loteCriado,
      status: false,
    });

    await criarLoteAction({
      ...dadosValidos,
      status: "false",
    });

    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: false,
        }),
      }),
    );
  });

  it("converte os IDs das DREs para números", async () => {
    requisicaoAutenticadaMock.mockResolvedValue(loteCriado);

    await criarLoteAction({
      ...dadosValidos,
      diretorias_regionais: ["10", "20", "30"],
    });

    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          diretorias_regionais: [10, 20, 30],
        }),
      }),
    );
  });

  it("retorna detail quando ele for uma string", async () => {
    const resultado = await executarComErroApi(
      {
        title: "Dados inválidos",
        detail: "Não foi possível criar o lote.",
      },
      400,
    );

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Dados inválidos",
      message: "Não foi possível criar o lote.",
      vinculados: [],
      status: 400,
    });
  });

  it("retorna a mensagem e os vínculos do detail", async () => {
    const vinculados: DreVinculada[] = [
      ["DRE PENHA", "LOTE-002"],
      ["DRE BUTANTÃ", "LOTE-003"],
    ];

    const resultado = await executarComErroApi({
      title: "DREs já vinculadas",
      detail: {
        message: "Algumas DREs já estão vinculadas a outros lotes.",
        vinculados,
      },
    });

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "DREs já vinculadas",
      message: "Algumas DREs já estão vinculadas a outros lotes.",
      vinculados,
      status: 400,
    });
  });

  it("retorna os vínculos mesmo quando detail não tem message", async () => {
    const vinculados: DreVinculada[] = [["DRE PENHA", "LOTE-002"]];

    const resultado = await executarComErroApi({
      title: "Erro de vínculo",
      detail: {
        vinculados,
      },
      message: "Revise as DREs selecionadas.",
    });

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro de vínculo",
      message: "Revise as DREs selecionadas.",
      vinculados,
      status: 400,
    });
  });

  it.each([
    [
      "message",
      {
        message: "Mensagem geral da API.",
      },
      "Mensagem geral da API.",
    ],
    [
      "codigo_cadastro",
      {
        codigo_cadastro: ["Código de cadastro já utilizado."],
      },
      "Código de cadastro já utilizado.",
    ],
    [
      "nome",
      {
        nome: ["Nome do lote inválido."],
      },
      "Nome do lote inválido.",
    ],
    [
      "empresa",
      {
        empresa: ["Empresa não encontrada."],
      },
      "Empresa não encontrada.",
    ],
    [
      "periodo_inicial",
      {
        periodo_inicial: ["Período inicial obrigatório."],
      },
      "Período inicial obrigatório.",
    ],
    [
      "periodo_final",
      {
        periodo_final: ["Período final não pode ser anterior."],
      },
      "Período final não pode ser anterior.",
    ],
    [
      "diretorias_regionais",
      {
        diretorias_regionais: ["Selecione pelo menos uma DRE."],
      },
      "Selecione pelo menos uma DRE.",
    ],
    [
      "non_field_errors",
      {
        non_field_errors: ["Os dados enviados são inválidos."],
      },
      "Os dados enviados são inválidos.",
    ],
  ])(
    "retorna a primeira mensagem do campo %s",
    async (_campo, dadosErro, mensagemEsperada) => {
      const resultado = await executarComErroApi(dadosErro as DadosErroTeste);

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

  it("prioriza detail sobre as outras mensagens", async () => {
    const resultado = await executarComErroApi({
      detail: "Mensagem do detail.",
      message: "Mensagem geral.",
      codigo_cadastro: ["Erro no código."],
      nome: ["Erro no nome."],
    });

    expect(resultado).toEqual(
      expect.objectContaining({
        message: "Mensagem do detail.",
      }),
    );
  });

  it("prioriza a mensagem do detail em objeto", async () => {
    const resultado = await executarComErroApi({
      detail: {
        message: "Mensagem interna do detail.",
      },
      message: "Mensagem geral.",
      codigo_cadastro: ["Erro no código."],
    });

    expect(resultado).toEqual(
      expect.objectContaining({
        message: "Mensagem interna do detail.",
      }),
    );
  });

  it("retorna valores padrões quando a API não envia dados", async () => {
    const resultado = await executarComErroApi(undefined, 500);

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Erro não identificado.",
      vinculados: [],
      status: 500,
    });
  });

  it("retorna mensagem padrão quando o objeto de erro está vazio", async () => {
    const resultado = await executarComErroApi({});

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Erro não identificado.",
      vinculados: [],
      status: 400,
    });
  });

  it("retorna status indefinido quando não existe response", async () => {
    const error = new Error("Erro sem resposta da API");

    isAxiosErrorMock.mockReturnValue(true);
    requisicaoAutenticadaMock.mockRejectedValue(error);

    const resultado = await criarLoteAction(dadosValidos);

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Erro não identificado.",
      vinculados: [],
      status: undefined,
    });
  });

  it("relança o erro quando não for um erro do Axios", async () => {
    const error = new Error("Erro inesperado");

    isAxiosErrorMock.mockReturnValue(false);
    requisicaoAutenticadaMock.mockRejectedValue(error);

    await expect(criarLoteAction(dadosValidos)).rejects.toBe(error);
  });
});
