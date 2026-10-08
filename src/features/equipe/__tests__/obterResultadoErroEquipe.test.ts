import { describe, expect, it } from "vitest";
import { obterResultadoErroEquipe } from "../services/obterResultadoErroEquipe";

function erroApi(data: unknown) {
  return { isAxiosError: true, response: { data, status: 400 } };
}

describe("obterResultadoErroEquipe", () => {
  it.each(["raiz", "detail"])("preserva os vínculos recebidos em %s", (origem) => {
    const vinculados = [{ profissional: "Ana", equipe: "Equipe 01" }];
    const data =
      origem === "raiz"
        ? { vinculados, detail: "Conflito de vínculo" }
        : { detail: { message: "Conflito de vínculo", vinculados } };

    expect(obterResultadoErroEquipe(erroApi(data))).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Conflito de vínculo",
      status: 400,
      vinculados,
    });
  });

  it("prioriza os vínculos da raiz sobre os do detalhe", () => {
    const vinculados = [{ profissional: "Ana", equipe: "Equipe 01" }];
    expect(
      obterResultadoErroEquipe(
        erroApi({
          vinculados,
          detail: {
            vinculados: [{ profissional: "Bruno", equipe: "Equipe 02" }],
          },
        }),
      ),
    ).toMatchObject({ vinculados });
  });

  it("ignora vínculos que não são uma lista", () => {
    expect(obterResultadoErroEquipe(erroApi({ vinculados: "inválido" }))).not.toHaveProperty(
      "vinculados",
    );
  });

  it.each([
    { detail: { message: "Mensagem" } },
    { message: "Mensagem" },
    { nome: ["Mensagem"] },
    { status: ["Mensagem"] },
    { situacao: ["Mensagem"] },
    { empresa: ["Mensagem"] },
    { lote: ["Mensagem"] },
    { non_field_errors: ["Mensagem"] },
  ])("extrai a mensagem do campo %j", (data) => {
    expect(obterResultadoErroEquipe(erroApi(data))).toMatchObject({ message: "Mensagem" });
  });

  it("preserva o título retornado pelo backend", () => {
    expect(obterResultadoErroEquipe(erroApi({ title: "Cadastro inválido" }))).toMatchObject({
      title: "Cadastro inválido",
    });
  });

  it.each([
    ["Profissional inválido", "Profissional inválido"],
    [["Selecione um profissional"], "Selecione um profissional"],
    [[{}, { funcao: ["Função inválida"] }], "Função inválida"],
    [{ profissional: ["Profissional inválido"] }, "Profissional inválido"],
    [{ "0": { funcao: ["Função inválida"] } }, "Função inválida"],
    [{ non_field_errors: ["Lista inválida"] }, "Lista inválida"],
    [null, "Erro não identificado."],
    [[], "Erro não identificado."],
    [42, "Erro não identificado."],
    ["", "Erro não identificado."],
  ])("trata profissionais no formato %j sem lançar exceção", (profissionais, message) => {
    expect(obterResultadoErroEquipe(erroApi({ profissionais }))).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message,
      status: 400,
    });
  });

  it("preserva a prioridade da mensagem geral", () => {
    expect(
      obterResultadoErroEquipe(
        erroApi({ detail: "Erro geral", profissionais: { funcao: ["Erro de função"] } }),
      ),
    ).toMatchObject({ message: "Erro geral" });
  });

  it("usa valores padrão para erro sem resposta", () => {
    expect(obterResultadoErroEquipe({ isAxiosError: true })).toMatchObject({
      message: "Erro não identificado.",
      success: false,
    });
  });

  it("relança erros inesperados", () => {
    const erro = new Error("Falha inesperada");
    expect(() => obterResultadoErroEquipe(erro)).toThrow(erro);
  });
});
