import { describe, expect, it } from "vitest";

import { Mensagens } from "@/constants/mensagens";
import {
  cargoSchema,
  type CargoFormData,
} from "@/features/cargo/schemas/cargoSchema";

describe("cargoSchema", () => {
  it("valida cargo que não exige documentos", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "false",
      novo_documento: "",
      documentos: [],
    });

    expect(resultado.success).toBe(true);

    if (resultado.success) {
      expect(resultado.data).toEqual({
        nome: "Eletricista",
        exige_documento: "false",
        novo_documento: "",
        documentos: [],
      });
    }
  });

  it("valida cargo usando o documento do campo principal", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "Certificado NR-10",
      documentos: [],
    });

    expect(resultado.success).toBe(true);
  });

  it("valida cargo usando um documento adicionado na lista", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "",
      documentos: [
        {
          nome: "Certificado NR-10",
        },
      ],
    });

    expect(resultado.success).toBe(true);
  });

  it("valida cargo sem informar o campo opcional novo_documento", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      documentos: [
        {
          nome: "RG",
        },
      ],
    });

    expect(resultado.success).toBe(true);
  });

  it("valida cargo sem informar a lista opcional de documentos", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "RG",
    });

    expect(resultado.success).toBe(true);
  });

  it("remove espaços do nome do cargo e dos documentos", () => {
    const resultado = cargoSchema.parse({
      nome: "  Eletricista  ",
      exige_documento: "true",
      novo_documento: "  Certificado NR-10  ",
      documentos: [
        {
          nome: "  RG  ",
        },
      ],
    });

    expect(resultado).toEqual({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "Certificado NR-10",
      documentos: [
        {
          nome: "RG",
        },
      ],
    });
  });

  it("rejeita nome de cargo vazio", () => {
    const resultado = cargoSchema.safeParse({
      nome: "   ",
      exige_documento: "false",
    });

    expect(resultado.success).toBe(false);

    if (!resultado.success) {
      expect(resultado.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["nome"],
            message: Mensagens.campo_obrigatorio,
          }),
        ]),
      );
    }
  });

  it("rejeita nome de cargo com mais de 255 caracteres", () => {
    const resultado = cargoSchema.safeParse({
      nome: "a".repeat(256),
      exige_documento: "false",
    });

    expect(resultado.success).toBe(false);

    if (!resultado.success) {
      expect(resultado.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["nome"],
            message: "O nome do cargo deve ter no máximo 255 caracteres.",
          }),
        ]),
      );
    }
  });

  it("aceita nome de cargo com exatamente 255 caracteres", () => {
    const resultado = cargoSchema.safeParse({
      nome: "a".repeat(255),
      exige_documento: "false",
    });

    expect(resultado.success).toBe(true);
  });

  it("rejeita valor inválido em exige_documento", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "sim",
    });

    expect(resultado.success).toBe(false);

    if (!resultado.success) {
      expect(resultado.error.issues[0]?.path).toEqual(["exige_documento"]);
    }
  });

  it("rejeita cargo que exige documento sem nenhum preenchido", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "",
      documentos: [],
    });

    expect(resultado.success).toBe(false);

    if (!resultado.success) {
      expect(resultado.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "custom",
            path: ["novo_documento"],
            message: "Informe ao menos um documento para este cargo.",
          }),
        ]),
      );
    }
  });

  it("rejeita documento principal contendo somente espaços", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "   ",
      documentos: [],
    });

    expect(resultado.success).toBe(false);

    if (!resultado.success) {
      expect(resultado.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["novo_documento"],
            message: "Informe ao menos um documento para este cargo.",
          }),
        ]),
      );
    }
  });

  it("rejeita documento principal com mais de 255 caracteres", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "a".repeat(256),
      documentos: [],
    });

    expect(resultado.success).toBe(false);

    if (!resultado.success) {
      expect(resultado.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["novo_documento"],
            message: "O nome do documento deve ter no máximo 255 caracteres.",
          }),
        ]),
      );
    }
  });

  it("aceita documento principal com exatamente 255 caracteres", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "a".repeat(255),
      documentos: [],
    });

    expect(resultado.success).toBe(true);
  });

  it("rejeita documento vazio dentro da lista", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "",
      documentos: [
        {
          nome: "   ",
        },
      ],
    });

    expect(resultado.success).toBe(false);

    if (!resultado.success) {
      expect(resultado.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["documentos", 0, "nome"],
            message: Mensagens.campo_obrigatorio,
          }),
        ]),
      );
    }
  });

  it("rejeita documento da lista com mais de 255 caracteres", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      documentos: [
        {
          nome: "a".repeat(256),
        },
      ],
    });

    expect(resultado.success).toBe(false);

    if (!resultado.success) {
      expect(resultado.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["documentos", 0, "nome"],
            message: "O nome do documento deve ter no máximo 255 caracteres.",
          }),
        ]),
      );
    }
  });

  it("aceita documento da lista com exatamente 255 caracteres", () => {
    const dados: CargoFormData = {
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "",
      documentos: [
        {
          nome: "a".repeat(255),
        },
      ],
    };

    const resultado = cargoSchema.safeParse(dados);

    expect(resultado.success).toBe(true);
  });
});
