import { describe, expect, it } from "vitest";
import { Mensagens } from "@/constants/mensagens";
import { EquipeSchema, ProfissionalEquipeSchema } from "../schema/equipeSchema";

const dados = {
  nome: "Equipe",
  situacao: "true",
  empresa: "empresa-1",
  lote: "lote-1",
  profissionais: [{ profissional: "profissional-1", funcao: "funcao-1" }],
};
describe("EquipeSchema", () => {
  it.each(["true", "false"])("aceita situação %s", (situacao) => {
    expect(EquipeSchema.parse({ ...dados, situacao })).toEqual({ ...dados, situacao });
  });
  it("rejeita situação ausente com a mensagem obrigatória", () => {
    const resultado = EquipeSchema.safeParse({ ...dados, situacao: undefined });
    expect(resultado.success).toBe(false);
    if (!resultado.success)
      expect(resultado.error.issues).toContainEqual(
        expect.objectContaining({ path: ["situacao"], message: "Situação é obrigatória!" }),
      );
  });
  it.each([true, false, "ativo", null])("rejeita situação inválida %j", (situacao) => {
    expect(EquipeSchema.safeParse({ ...dados, situacao }).success).toBe(false);
  });
  it.each(["nome", "empresa", "lote"])("rejeita %s vazio ou somente espaços", (campo) => {
    const resultado = EquipeSchema.safeParse({ ...dados, [campo]: "   " });
    expect(resultado.success).toBe(false);
    if (!resultado.success)
      expect(resultado.error.issues).toContainEqual(
        expect.objectContaining({ path: [campo], message: Mensagens.campo_obrigatorio }),
      );
  });
  it("exige pelo menos um profissional", () => {
    const resultado = EquipeSchema.safeParse({ ...dados, profissionais: [] });
    expect(resultado.success).toBe(false);
    if (!resultado.success)
      expect(resultado.error.issues).toContainEqual(
        expect.objectContaining({
          path: ["profissionais"],
          message: "Adicione pelo menos um profissional!",
        }),
      );
  });
  it("remove espaços dos campos textuais e das seleções", () => {
    expect(
      EquipeSchema.parse({
        ...dados,
        nome: " Equipe ",
        empresa: " empresa-1 ",
        lote: " lote-1 ",
        profissionais: [{ profissional: " profissional-1 ", funcao: " funcao-1 " }],
      }),
    ).toEqual(dados);
  });
});
describe("ProfissionalEquipeSchema", () => {
  it.each(["profissional", "funcao"])("exige %s", (campo) => {
    const resultado = ProfissionalEquipeSchema.safeParse({
      ...dados.profissionais[0],
      [campo]: " ",
    });
    expect(resultado.success).toBe(false);
    if (!resultado.success)
      expect(resultado.error.issues).toContainEqual(
        expect.objectContaining({ path: [campo], message: Mensagens.campo_obrigatorio }),
      );
  });
});
