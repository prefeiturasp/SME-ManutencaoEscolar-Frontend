import { describe, expect, it } from "vitest";

import { profissionalSchema } from "../schemas/profissional.schema";

const dadosValidos = {
  nome: "João da Silva",
  rg: "123456789",
  cpf: "123.456.789-01",
  status: "true" as const,
  funcoes: [{ uuid_cargo: "cargo-uuid", documentos: [] }],
};

describe("profissionalSchema", () => {
  it("normaliza os documentos e o status do profissional", () => {
    expect(profissionalSchema.parse(dadosValidos)).toEqual({
      ...dadosValidos,
      rg: "123456789",
      cpf: "12345678901",
      status: true,
    });
  });

  it("aceita RG alfanumérico e normaliza letras para maiúsculas", () => {
    expect(profissionalSchema.parse({ ...dadosValidos, rg: "12345678x" }).rg).toBe(
      "12345678X",
    );
    expect(profissionalSchema.safeParse({ ...dadosValidos, rg: "12.345.678-9" }).success).toBe(false);
    expect(profissionalSchema.safeParse({ ...dadosValidos, rg: "123456-@" }).success).toBe(false);
  });

  it("exige o arquivo de cada documento associado à função", () => {
    const resultado = profissionalSchema.safeParse({
      ...dadosValidos,
      funcoes: [
        {
          uuid_cargo: "cargo-uuid",
          documentos: [{ arquivo: [] }],
        },
      ],
    });

    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0].message).toBe("O documento é obrigatório!");
  });
});
