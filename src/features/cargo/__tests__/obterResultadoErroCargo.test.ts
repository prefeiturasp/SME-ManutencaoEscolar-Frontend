import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CriarCargoResultado } from "../types/cargos.types";

const { isAxiosErrorMock } = vi.hoisted(() => ({
  isAxiosErrorMock: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    isAxiosError: isAxiosErrorMock,
  },
}));

import { obterResultadoErroCargo } from "../services/obterResultadoErroCargo";

type ResultadoErroCargo = Extract<CriarCargoResultado, { success: false }>;

function obterResultadoDeErro(
  resultado: CriarCargoResultado,
): ResultadoErroCargo {
  if (resultado.success) {
    throw new Error("Era esperado um resultado de erro.");
  }

  return resultado;
}

describe("obterResultadoErroCargo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAxiosErrorMock.mockReturnValue(true);
  });

  it("lança novamente quando o erro não é do Axios", () => {
    const error = new Error("Erro inesperado");

    isAxiosErrorMock.mockReturnValue(false);

    expect(() => obterResultadoErroCargo(error)).toThrow("Erro inesperado");

    expect(isAxiosErrorMock).toHaveBeenCalledWith(error);
  });

  it("retorna valores padrão quando não existe response", () => {
    const error = new Error("Erro de conexão");

    const resultado = obterResultadoDeErro(obterResultadoErroCargo(error));

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Erro não identificado.",
      status: undefined,
    });

    expect(isAxiosErrorMock).toHaveBeenCalledWith(error);
  });

  it("retorna detail quando ele é uma string", () => {
    const error = {
      response: {
        status: 400,
        data: {
          title: "Dados inválidos",
          detail: "Não foi possível cadastrar o cargo.",
        },
      },
    };

    const resultado = obterResultadoDeErro(obterResultadoErroCargo(error));

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Dados inválidos",
      message: "Não foi possível cadastrar o cargo.",
      status: 400,
    });
  });

  it("retorna message de dentro do objeto detail", () => {
    const error = {
      response: {
        status: 400,
        data: {
          title: "Cargo já cadastrado",
          detail: {
            message: "Já existe um cargo com o nome Eletricista cadastrado.",
          },
        },
      },
    };

    const resultado = obterResultadoDeErro(obterResultadoErroCargo(error));

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Cargo já cadastrado",
      message: "Já existe um cargo com o nome Eletricista cadastrado.",
      status: 400,
    });
  });

  it("retorna a propriedade message quando detail não possui mensagem", () => {
    const error = {
      response: {
        status: 400,
        data: {
          title: "Erro",
          detail: {},
          message: "Mensagem principal do erro.",
        },
      },
    };

    const resultado = obterResultadoDeErro(obterResultadoErroCargo(error));

    expect(resultado.message).toBe("Mensagem principal do erro.");
  });

  it("retorna o primeiro erro do nome do cargo", () => {
    const error = {
      response: {
        status: 400,
        data: {
          nome: ["O nome do cargo é obrigatório.", "Segundo erro do nome."],
        },
      },
    };

    const resultado = obterResultadoDeErro(obterResultadoErroCargo(error));

    expect(resultado.message).toBe("O nome do cargo é obrigatório.");
  });

  it("retorna o primeiro erro de exige_documento", () => {
    const error = {
      response: {
        status: 400,
        data: {
          exige_documento: ["Informe se o cargo exige documento."],
        },
      },
    };

    const resultado = obterResultadoDeErro(obterResultadoErroCargo(error));

    expect(resultado.message).toBe("Informe se o cargo exige documento.");
  });

  it("retorna o primeiro erro de status", () => {
    const error = {
      response: {
        status: 400,
        data: {
          status: ["O status informado é inválido."],
        },
      },
    };

    const resultado = obterResultadoDeErro(obterResultadoErroCargo(error));

    expect(resultado.message).toBe("O status informado é inválido.");
  });

  it("retorna o erro quando documentos é uma lista de strings", () => {
    const error = {
      response: {
        status: 400,
        data: {
          documentos: ["Informe ao menos um documento."],
        },
      },
    };

    const resultado = obterResultadoDeErro(obterResultadoErroCargo(error));

    expect(resultado.message).toBe("Informe ao menos um documento.");
  });

  it("retorna o erro do nome de um documento", () => {
    const error = {
      response: {
        status: 400,
        data: {
          documentos: [
            {
              nome: ["O nome do documento é obrigatório."],
            },
          ],
        },
      },
    };

    const resultado = obterResultadoDeErro(obterResultadoErroCargo(error));

    expect(resultado.message).toBe("O nome do documento é obrigatório.");
  });

  it("retorna non_field_errors quando não há outro erro", () => {
    const error = {
      response: {
        status: 400,
        data: {
          documentos: [],
          non_field_errors: ["Os dados informados são inválidos."],
        },
      },
    };

    const resultado = obterResultadoDeErro(obterResultadoErroCargo(error));

    expect(resultado.message).toBe("Os dados informados são inválidos.");
  });

  it("retorna erro não identificado quando documento não possui nome", () => {
    const error = {
      response: {
        status: 400,
        data: {
          documentos: [{}],
        },
      },
    };

    const resultado = obterResultadoDeErro(obterResultadoErroCargo(error));

    expect(resultado.message).toBe("Erro não identificado.");
  });

  it("retorna erro não identificado quando os dados estão vazios", () => {
    const error = {
      response: {
        status: 500,
        data: {},
      },
    };

    const resultado = obterResultadoDeErro(obterResultadoErroCargo(error));

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Erro não identificado.",
      status: 500,
    });
  });

  it("prioriza detail em relação às demais mensagens", () => {
    const error = {
      response: {
        status: 400,
        data: {
          title: "Erro de validação",
          detail: {
            message: "Mensagem dentro de detail.",
          },
          message: "Mensagem principal.",
          nome: ["Erro no nome."],
          exige_documento: ["Erro no exige documento."],
          status: ["Erro no status."],
          documentos: ["Erro nos documentos."],
          non_field_errors: ["Erro geral."],
        },
      },
    };

    const resultado = obterResultadoDeErro(obterResultadoErroCargo(error));

    expect(resultado.message).toBe("Mensagem dentro de detail.");
  });

  it("prioriza message em relação aos erros dos campos", () => {
    const error = {
      response: {
        status: 400,
        data: {
          message: "Mensagem principal.",
          nome: ["Erro no nome."],
          exige_documento: ["Erro no exige documento."],
          status: ["Erro no status."],
          documentos: ["Erro nos documentos."],
          non_field_errors: ["Erro geral."],
        },
      },
    };

    const resultado = obterResultadoDeErro(obterResultadoErroCargo(error));

    expect(resultado.message).toBe("Mensagem principal.");
  });
});
