import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { obterResultadoErroUnidadeEducacional } from "@/features/unidade_educacional/services/obterResultadoErroUnidadeEducacional";

describe("obterResultadoErroUnidadeEducacional", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve relançar o erro quando não for um erro do Axios", () => {
    const erro = new Error("Erro inesperado");

    vi.spyOn(axios, "isAxiosError").mockReturnValue(false);

    expect(() => obterResultadoErroUnidadeEducacional(erro)).toThrow("Erro inesperado");
  });

  it("deve retornar a mensagem padrão quando o erro Axios não possuir dados na resposta", () => {
    const erro = {
      response: undefined,
    };

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = obterResultadoErroUnidadeEducacional(erro);

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Não conseguimos salvar as informações. Por favor, tente novamente.",
      status: undefined,
    });
  });

  it("deve utilizar a mensagem de detail quando detail for uma string", () => {
    const erro = {
      response: {
        status: 400,
        data: {
          title: "Não é possível adicionar o contato",
          detail: "Já existe um contato com o CPF/RF informado.",
        },
      },
    };

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = obterResultadoErroUnidadeEducacional(erro);

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Não é possível adicionar o contato",
      message: "Já existe um contato com o CPF/RF informado.",
      status: 400,
    });
  });

  it("deve utilizar message quando detail não for uma string", () => {
    const erro = {
      response: {
        status: 400,
        data: {
          title: "Erro de validação",
          detail: {
            message: "Dados inválidos.",
          },
          message: "Mensagem de validação.",
        },
      },
    };

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = obterResultadoErroUnidadeEducacional(erro);

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro de validação",
      message: "Mensagem de validação.",
      status: 400,
    });
  });

  it("deve utilizar o título padrão quando title não for informado", () => {
    const erro = {
      response: {
        status: 500,
        data: {
          message: "Erro interno do servidor.",
        },
      },
    };

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = obterResultadoErroUnidadeEducacional(erro);

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Erro interno do servidor.",
      status: 500,
    });
  });

  it("deve utilizar a mensagem padrão quando detail e message não forem informados", () => {
    const erro = {
      response: {
        status: 400,
        data: {},
      },
    };

    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const resultado = obterResultadoErroUnidadeEducacional(erro);

    expect(resultado).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Não conseguimos salvar as informações. Por favor, tente novamente.",
      status: 400,
    });
  });
});
