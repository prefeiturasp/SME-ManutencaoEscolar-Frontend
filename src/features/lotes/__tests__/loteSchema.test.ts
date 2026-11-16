import { describe, expect, it } from "vitest";

import { LoteSchema } from "@/features/lotes/schemas/loteSchema";

const dadosValidos = {
  codigo_cadastro: "LOTE-001",
  codigo_contrato: "31/SME/2021-SME/COMPS",
  empresa: "empresa-uuid",
  nome: "Lote de manutenção",
  periodo_inicial: "2026-01-01",
  periodo_final: "2026-12-31",
  status: "true",
  diretorias_regionais: ["1"],
};

function mensagensDoCampo(dados: Record<string, unknown>, campo: string) {
  const resultado = LoteSchema.safeParse(dados);

  if (resultado.success) {
    return [];
  }

  return resultado.error.issues
    .filter((issue) => issue.path[0] === campo)
    .map((issue) => issue.message);
}

describe("LoteSchema - codigo_contrato", () => {
  it.each(["31/SME/2021-SME/COMPS", "ABC123", "12.345-A/2026"])(
    "aceita o código de contrato %s",
    (codigo) => {
      const resultado = LoteSchema.safeParse({
        ...dadosValidos,
        codigo_contrato: codigo,
      });

      expect(resultado.success).toBe(true);
    },
  );

  it("remove os espaços nas extremidades", () => {
    const resultado = LoteSchema.parse({
      ...dadosValidos,
      codigo_contrato: "  31/SME/2021-SME/COMPS  ",
    });

    expect(resultado.codigo_contrato).toBe("31/SME/2021-SME/COMPS");
  });

  it.each(["", "   "])("exige o preenchimento (%j)", (codigo) => {
    expect(
      mensagensDoCampo({ ...dadosValidos, codigo_contrato: codigo }, "codigo_contrato"),
    ).toContain("Campo obrigatório");
  });

  it.each(["31 SME", "31_SME", "31/SME#2021", "contrato ção"])(
    "rejeita caracteres inválidos (%s)",
    (codigo) => {
      expect(
        mensagensDoCampo({ ...dadosValidos, codigo_contrato: codigo }, "codigo_contrato"),
      ).toEqual([expect.stringContaining("Código do contrato inválido")]);
    },
  );

  it("rejeita código com mais de 100 caracteres", () => {
    expect(
      mensagensDoCampo({ ...dadosValidos, codigo_contrato: "A".repeat(101) }, "codigo_contrato"),
    ).toEqual(["O código do contrato deve ter no máximo 100 caracteres."]);
  });

  it("aceita código com exatamente 100 caracteres", () => {
    const resultado = LoteSchema.safeParse({
      ...dadosValidos,
      codigo_contrato: "A".repeat(100),
    });

    expect(resultado.success).toBe(true);
  });
});
