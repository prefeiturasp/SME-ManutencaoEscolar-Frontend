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

  it("aceita RG de 7 a 20 caracteres e rejeita fora desse tamanho", () => {
    const rgComTamanho = (tamanho: number) => "A1".repeat(tamanho).slice(0, tamanho);

    expect(profissionalSchema.safeParse({ ...dadosValidos, rg: rgComTamanho(7) }).success).toBe(true);
    expect(profissionalSchema.safeParse({ ...dadosValidos, rg: rgComTamanho(20) }).success).toBe(true);
    expect(profissionalSchema.safeParse({ ...dadosValidos, rg: rgComTamanho(6) }).success).toBe(false);
    expect(profissionalSchema.safeParse({ ...dadosValidos, rg: rgComTamanho(21) }).success).toBe(false);
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

  it("rejeita arquivo acima do tamanho máximo individual", () => {
    const arquivoGrande = new File(["x"], "grande.png");
    Object.defineProperty(arquivoGrande, "size", { value: 21 * 1024 * 1024 });

    const resultado = profissionalSchema.safeParse({
      ...dadosValidos,
      funcoes: [{ uuid_cargo: "cargo-uuid", documentos: [{ arquivo: [arquivoGrande] }] }],
    });

    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues.map((issue) => issue.message)).toContain(
      "O arquivo não pode ser maior que 2 MB!",
    );
  });

  it.each(["documento.pdf", "documento.gif", "documento"])(
    "rejeita arquivo com formato inválido (%s)",
    (nome) => {
      const resultado = profissionalSchema.safeParse({
        ...dadosValidos,
        funcoes: [
          { uuid_cargo: "cargo-uuid", documentos: [{ arquivo: [new File(["x"], nome)] }] },
        ],
      });

      expect(resultado.success).toBe(false);
      expect(resultado.error?.issues).toEqual([
        expect.objectContaining({
          message: "Formato de arquivo inválido! Formatos permitidos: PNG, JPG e JPEG.",
          path: ["funcoes", 0, "documentos", 0, "arquivo"],
        }),
      ]);
    },
  );

  it("aceita extensões permitidas independentemente de maiúsculas", () => {
    const resultado = profissionalSchema.safeParse({
      ...dadosValidos,
      funcoes: [
        {
          uuid_cargo: "cargo-uuid",
          documentos: ["a.PNG", "b.Jpg", "c.jpeg"].map((nome) => ({
            arquivo: [new File(["x"], nome)],
          })),
        },
      ],
    });

    expect(resultado.success).toBe(true);
  });

  it("aceita documento já persistido sem novo arquivo", () => {
    const resultado = profissionalSchema.safeParse({
      ...dadosValidos,
      funcoes: [{ uuid_cargo: "cargo-uuid", documentos: [{ uuid: "documento-1" }] }],
    });

    expect(resultado.success).toBe(true);
  });

  it("permite arquivos cuja soma seja de até 10 MB", () => {
    const resultado = profissionalSchema.safeParse({
      ...dadosValidos,
      funcoes: [
        {
          uuid_cargo: "cargo-uuid",
          documentos: Array.from({ length: 5 }, (_, index) => ({
            uuid: `documento-${index + 1}`,
            arquivo: [new File([new Uint8Array(2 * 1024 * 1024)], `arquivo-${index + 1}.png`)],
          })),
        },
      ],
    });

    expect(resultado.success).toBe(true);
  });

  it("rejeita arquivos cuja soma ultrapasse 10 MB", () => {
    const resultado = profissionalSchema.safeParse({
      ...dadosValidos,
      funcoes: [
        {
          uuid_cargo: "cargo-uuid",
          documentos: [
            { uuid: "documento-1", arquivo: [new File([new Uint8Array(2 * 1024 * 1024)], "a.png")] },
            { uuid: "documento-2", arquivo: [new File([new Uint8Array(2 * 1024 * 1024)], "b.png")] },
            { uuid: "documento-3", arquivo: [new File([new Uint8Array(2 * 1024 * 1024)], "c.png")] },
            { uuid: "documento-4", arquivo: [new File([new Uint8Array(2 * 1024 * 1024)], "d.png")] },
            { uuid: "documento-5", arquivo: [new File([new Uint8Array(2 * 1024 * 1024)], "e.png")] },
            { uuid: "documento-6", arquivo: [new File([new Uint8Array(1)], "f.png")] },
          ],
        },
      ],
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues).toContainEqual(
        expect.objectContaining({ message: "A soma dos arquivos não pode ultrapassar 10 MB!" }),
      );
    }
  });
});
