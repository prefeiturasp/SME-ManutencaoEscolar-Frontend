import { isAxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { obterMensagemErro } from "../erro";

vi.mock("axios", () => ({
  isAxiosError: vi.fn(),
}));

const mockIsAxiosError = vi.mocked(isAxiosError);

const MENSAGEM_PADRAO = "Falha ao salvar. Por favor, tente novamente.";

describe("obterMensagemErro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAxiosError.mockReturnValue(false);
  });

  it("retorna title e detail de um erro Axios", () => {
    mockIsAxiosError.mockReturnValue(true);

    const resultado = obterMensagemErro({
      response: {
        data: {
          title: "Erro de validação",
          detail: "Os dados enviados são inválidos.",
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro de validação",
      descricao: "Os dados enviados são inválidos.",
      status: undefined,
    });
  });

  it("retorna o status HTTP de um erro Axios", () => {
    mockIsAxiosError.mockReturnValue(true);

    const resultado = obterMensagemErro({
      response: {
        status: 400,
        data: {
          title: "Erro de validação",
          detail: "Dados inválidos.",
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro de validação",
      descricao: "Dados inválidos.",
      status: 400,
    });
  });

  it("retorna a mensagem e o status de um erro HTTP 500", () => {
    mockIsAxiosError.mockReturnValue(true);

    const resultado = obterMensagemErro({
      response: {
        status: 500,
        data: {
          title: "Erro interno",
          detail: "Não foi possível processar a solicitação.",
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro interno",
      descricao: "Não foi possível processar a solicitação.",
      status: 500,
    });
  });

  it("prioriza o status da resposta Axios sobre o status dos dados", () => {
    mockIsAxiosError.mockReturnValue(true);

    const resultado = obterMensagemErro({
      response: {
        status: 500,
        data: {
          detail: "Erro no servidor.",
          status: 400,
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Erro no servidor.",
      status: 500,
    });
  });

  it("usa o status dos dados quando a resposta não informa status", () => {
    const resultado = obterMensagemErro({
      response: {
        data: {
          detail: "Erro no servidor.",
          status: 500,
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Erro no servidor.",
      status: 500,
    });
  });

  it("retorna o primeiro erro do campo nome", () => {
    const resultado = obterMensagemErro({
      response: {
        data: {
          nome: ["Este nome já está cadastrado.", "Outro erro."],
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Este nome já está cadastrado.",
      status: undefined,
    });
  });

  it("retorna message quando detail e nome não existem", () => {
    const resultado = obterMensagemErro({
      response: {
        data: {
          message: "Não foi possível realizar a operação.",
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Não foi possível realizar a operação.",
      status: undefined,
    });
  });

  it("prioriza detail sobre nome, message e outros campos", () => {
    const resultado = obterMensagemErro({
      response: {
        data: {
          detail: "Mensagem do detail.",
          nome: ["Mensagem do nome."],
          message: "Mensagem do message.",
          outroCampo: "Outra mensagem.",
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Mensagem do detail.",
      status: undefined,
    });
  });

  it("prioriza nome sobre message e outros campos", () => {
    const resultado = obterMensagemErro({
      response: {
        data: {
          nome: ["Mensagem do nome."],
          message: "Mensagem do message.",
          outroCampo: "Outra mensagem.",
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Mensagem do nome.",
      status: undefined,
    });
  });

  it("prioriza message sobre outros campos", () => {
    const resultado = obterMensagemErro({
      response: {
        data: {
          message: "Mensagem do message.",
          outroCampo: "Outra mensagem.",
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Mensagem do message.",
      status: undefined,
    });
  });

  it("retorna a primeira mensagem válida de um campo desconhecido", () => {
    const resultado = obterMensagemErro({
      response: {
        data: {
          codigo: ["", 123, "Código inválido."],
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Código inválido.",
      status: undefined,
    });
  });

  it("extrai uma mensagem armazenada diretamente como string", () => {
    const resultado = obterMensagemErro({
      response: {
        data: {
          email: "E-mail inválido.",
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "E-mail inválido.",
      status: undefined,
    });
  });

  it("ignora valores não textuais nos campos desconhecidos", () => {
    const resultado = obterMensagemErro({
      response: {
        data: {
          campo1: "",
          campo2: "   ",
          campo3: 123,
          campo4: null,
          campo5: [null, 10, "", "   "],
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: MENSAGEM_PADRAO,
      status: undefined,
    });
  });

  it("usa o fallback quando o erro Axios não possui response", () => {
    mockIsAxiosError.mockReturnValue(true);

    const resultado = obterMensagemErro({});

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: MENSAGEM_PADRAO,
      status: undefined,
    });
  });

  it("usa o fallback quando response não possui data", () => {
    const resultado = obterMensagemErro({
      response: {},
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: MENSAGEM_PADRAO,
      status: undefined,
    });
  });

  it("preserva o status quando response não possui data", () => {
    const resultado = obterMensagemErro({
      response: {
        status: 500,
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: MENSAGEM_PADRAO,
      status: 500,
    });
  });

  it.each([
    ["uma string", "erro"],
    ["um número", 500],
    ["null", null],
    ["undefined", undefined],
    ["um booleano", false],
    ["um objeto sem response", {}],
  ])("usa o fallback quando recebe %s", (_, error) => {
    const resultado = obterMensagemErro(error);

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: MENSAGEM_PADRAO,
      status: undefined,
    });
  });

  it("usa o fallback quando detail é um número", () => {
    const resultado = obterMensagemErro({
      response: {
        data: {
          detail: 500,
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: MENSAGEM_PADRAO,
      status: undefined,
    });
  });

  it("usa o fallback e preserva o status quando detail é um número", () => {
    mockIsAxiosError.mockReturnValue(true);

    const resultado = obterMensagemErro({
      response: {
        status: 500,
        data: {
          detail: 500,
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: MENSAGEM_PADRAO,
      status: 500,
    });
  });

  it("usa o fallback quando o erro 500 retorna uma página HTML", () => {
    mockIsAxiosError.mockReturnValue(true);

    const resultado = obterMensagemErro({
      response: {
        status: 500,
        data: "<!DOCTYPE html><html><body>Erro interno</body></html>",
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: MENSAGEM_PADRAO,
      status: 500,
    });
  });

  it("usa o fallback quando data é um array", () => {
    const resultado = obterMensagemErro({
      response: {
        data: ["<", "html", ">"],
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: MENSAGEM_PADRAO,
      status: undefined,
    });
  });

  it("retorna a primeira mensagem válida de um array", () => {
    const resultado = obterMensagemErro({
      response: {
        data: {
          nome: [],
          erros: [
            "",
            "   ",
            null,
            undefined,
            123,
            "Primeira mensagem válida.",
            "Segunda mensagem válida.",
          ],
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Primeira mensagem válida.",
      status: undefined,
    });
  });

  it("extrai erros de validação aninhados retornados pelo DRF", () => {
    const resultado = obterMensagemErro({
      response: {
        data: {
          responsaveis_tecnicos: [
            {
              arquivos: [
                {
                  uuid: ["Anexo não encontrado para este responsável."],
                },
              ],
            },
          ],
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Anexo não encontrado para este responsável.",
      status: undefined,
    });
  });

  it("usa uma mensagem padrão personalizada", () => {
    const resultado = obterMensagemErro(
      {
        response: {
          data: {},
        },
      },
      "Não foi possível continuar.",
    );

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Não foi possível continuar.",
      status: undefined,
    });
  });

  it("usa a mensagem personalizada quando detail não é texto", () => {
    const resultado = obterMensagemErro(
      {
        response: {
          data: {
            detail: 500,
          },
        },
      },
      "Tente novamente mais tarde.",
    );

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Tente novamente mais tarde.",
      status: undefined,
    });
  });
});
