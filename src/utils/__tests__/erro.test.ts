import { isAxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { obterMensagemErro } from "../erro";

vi.mock("axios", () => ({
  isAxiosError: vi.fn(),
}));

const mockIsAxiosError = vi.mocked(isAxiosError);

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
    });
  });

  it("retorna o primeiro erro do campo nome", () => {
    const resultado = obterMensagemErro({
      response: {
        data: {
          nome: ["Este nome já está cadastrado."],
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Este nome já está cadastrado.",
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
    });
  });

  it("retorna a primeira mensagem encontrada em um campo desconhecido", () => {
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
    });
  });

  it("ignora strings vazias, espaços e valores que não são strings", () => {
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
      descricao: "Falha no cadastro. Por favor, tente novamente.",
    });
  });

  it("respeita a prioridade detail, nome, message e demais campos", () => {
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
    });
  });

  it("usa o fallback quando o erro Axios não possui response", () => {
    mockIsAxiosError.mockReturnValue(true);

    const resultado = obterMensagemErro({});

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Falha no cadastro. Por favor, tente novamente.",
    });
  });

  it("usa o fallback quando response não possui data", () => {
    const resultado = obterMensagemErro({
      response: {},
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Falha no cadastro. Por favor, tente novamente.",
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
      descricao: "Falha no cadastro. Por favor, tente novamente.",
    });
  });

  it("usa o fallback quando a descrição encontrada não é string", () => {
    const resultado = obterMensagemErro({
      response: {
        data: {
          detail: 500,
        },
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Falha no cadastro. Por favor, tente novamente.",
    });
  });

  it("usa o fallback quando a resposta é uma página HTML (string)", () => {
    mockIsAxiosError.mockReturnValue(true);

    const resultado = obterMensagemErro({
      response: {
        data: "<!DOCTYPE html><html><body>502 Bad Gateway</body></html>",
      },
    });

    expect(resultado).toEqual({
      titulo: "Erro",
      descricao: "Falha no cadastro. Por favor, tente novamente.",
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
      descricao: "Falha no cadastro. Por favor, tente novamente.",
    });
  });

  it("retorna apenas as mensagens válidas de um array", () => {
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
    });
  });
});
