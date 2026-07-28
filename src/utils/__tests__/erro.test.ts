import { describe, expect, it } from "vitest";
import { obterMensagemErro } from "../erro";

describe("obterMensagemErro", () => {
  it("deve priorizar o detalhe retornado pelo backend", () => {
    const erro = {
      response: {
        data: {
          title: "Erro de validação",
          detail: "Já existe um fornecedor com este CNPJ.",
        },
      },
    };

    expect(obterMensagemErro(erro)).toEqual({
      titulo: "Erro de validação",
      descricao: "Já existe um fornecedor com este CNPJ.",
    });
  });

  it("deve usar o fallback quando o backend não retornar mensagem", () => {
    expect(obterMensagemErro({})).toEqual({
      titulo: "Erro",
      descricao: "Falha no cadastro. Por favor, tente novamente.",
    });
  });
});
