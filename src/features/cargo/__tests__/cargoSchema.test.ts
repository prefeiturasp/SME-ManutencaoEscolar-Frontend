import { describe, expect, it } from "vitest";

import { Mensagens } from "@/constants/mensagens";

import {
  cargoSchema,
  type CargoFormData,
} from "@/features/cargo/schemas/cargoSchema";

function obterMensagensDeErro(
  resultado: ReturnType<typeof cargoSchema.safeParse>,
  campo: string,
): string[] {
  if (resultado.success) {
    return [];
  }

  return resultado.error.issues
    .filter((erro) => erro.path.join(".") === campo)
    .map((erro) => erro.message);
}

describe("cargoSchema", () => {
  it("valida um cargo que exige documentos", () => {
    const dados: CargoFormData = {
      nome: "Engenheiro Eletricista",
      exige_documento: "true",
      novo_documento: "",
      documentos: [
        {
          nome: "Certificado NR-10",
        },
      ],
    };

    const resultado = cargoSchema.safeParse(dados);

    expect(resultado.success).toBe(true);

    if (!resultado.success) {
      return;
    }

    expect(resultado.data).toEqual(dados);
  });

  it("valida um cargo utilizando somente o novo documento", () => {
    const dados: CargoFormData = {
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "Certificado NR-10",
      documentos: [],
    };

    const resultado = cargoSchema.safeParse(dados);

    expect(resultado.success).toBe(true);
  });

  it("valida um cargo que não exige documentos", () => {
    const dados: CargoFormData = {
      nome: "Auxiliar Administrativo",
      exige_documento: "false",
      novo_documento: "",
      documentos: [],
    };

    const resultado = cargoSchema.safeParse(dados);

    expect(resultado.success).toBe(true);
  });

  it("valida um cargo sem informar a lista de documentos", () => {
    const dados: CargoFormData = {
      nome: "Auxiliar Administrativo",
      exige_documento: "false",
    };

    const resultado = cargoSchema.safeParse(dados);

    expect(resultado.success).toBe(true);
  });

  it("remove os espaços do nome do cargo", () => {
    const resultado = cargoSchema.safeParse({
      nome: "   Engenheiro Eletricista   ",
      exige_documento: "false",
    });

    expect(resultado.success).toBe(true);

    if (!resultado.success) {
      return;
    }

    expect(resultado.data.nome).toBe("Engenheiro Eletricista");
  });

  it("remove os espaços do novo documento", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "   Certificado NR-10   ",
      documentos: [],
    });

    expect(resultado.success).toBe(true);

    if (!resultado.success) {
      return;
    }

    expect(resultado.data.novo_documento).toBe("Certificado NR-10");
  });

  it("remove os espaços dos documentos existentes", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "",
      documentos: [
        {
          nome: "   Certificado NR-10   ",
        },
      ],
    });

    expect(resultado.success).toBe(true);

    if (!resultado.success) {
      return;
    }

    expect(resultado.data.documentos).toEqual([
      {
        nome: "Certificado NR-10",
      },
    ]);
  });

  it("rejeita nome de cargo vazio", () => {
    const resultado = cargoSchema.safeParse({
      nome: "",
      exige_documento: "false",
    });

    expect(resultado.success).toBe(false);

    expect(obterMensagensDeErro(resultado, "nome")).toContain(
      Mensagens.campo_obrigatorio,
    );
  });

  it("rejeita nome de cargo contendo somente espaços", () => {
    const resultado = cargoSchema.safeParse({
      nome: "     ",
      exige_documento: "false",
    });

    expect(resultado.success).toBe(false);

    expect(obterMensagensDeErro(resultado, "nome")).toContain(
      Mensagens.campo_obrigatorio,
    );
  });

  it("rejeita nome de cargo com mais de 255 caracteres", () => {
    const resultado = cargoSchema.safeParse({
      nome: "a".repeat(256),
      exige_documento: "false",
    });

    expect(resultado.success).toBe(false);

    expect(obterMensagensDeErro(resultado, "nome")).toContain(
      "O nome do cargo deve ter no máximo 255 caracteres.",
    );
  });

  it("aceita nome de cargo com exatamente 255 caracteres", () => {
    const resultado = cargoSchema.safeParse({
      nome: "a".repeat(255),
      exige_documento: "false",
    });

    expect(resultado.success).toBe(true);
  });

  it("exige a seleção do campo exige_documento", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: undefined,
    });

    expect(resultado.success).toBe(false);

    expect(obterMensagensDeErro(resultado, "exige_documento")).toContain(
      "Informe se o cargo exige documento.",
    );
  });

  it("rejeita valor inválido no campo exige_documento", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "sim",
    });

    expect(resultado.success).toBe(false);

    expect(obterMensagensDeErro(resultado, "exige_documento")).not.toHaveLength(
      0,
    );
  });

  it("exige ao menos um documento quando o cargo exige documento", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "",
      documentos: [],
    });

    expect(resultado.success).toBe(false);

    expect(obterMensagensDeErro(resultado, "novo_documento")).toContain(
      "Informe ao menos um documento para este cargo.",
    );
  });

  it("rejeita cargo que exige documento quando os campos estão ausentes", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
    });

    expect(resultado.success).toBe(false);

    expect(obterMensagensDeErro(resultado, "novo_documento")).toContain(
      "Informe ao menos um documento para este cargo.",
    );
  });

  it("considera novo documento com espaços como vazio", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "     ",
      documentos: [],
    });

    expect(resultado.success).toBe(false);

    expect(obterMensagensDeErro(resultado, "novo_documento")).toContain(
      "Informe ao menos um documento para este cargo.",
    );
  });

  it("aceita documento existente quando o novo documento está vazio", () => {
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

  it("rejeita novo documento com mais de 255 caracteres", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "a".repeat(256),
      documentos: [],
    });

    expect(resultado.success).toBe(false);

    expect(obterMensagensDeErro(resultado, "novo_documento")).toContain(
      "O nome do documento deve ter no máximo 255 caracteres.",
    );
  });

  it("aceita novo documento com exatamente 255 caracteres", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "a".repeat(255),
      documentos: [],
    });

    expect(resultado.success).toBe(true);
  });

  it("rejeita documento existente com nome vazio", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "",
      documentos: [
        {
          nome: "",
        },
      ],
    });

    expect(resultado.success).toBe(false);

    expect(obterMensagensDeErro(resultado, "documentos.0.nome")).toContain(
      Mensagens.campo_obrigatorio,
    );
  });

  it("rejeita documento existente contendo somente espaços", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "",
      documentos: [
        {
          nome: "     ",
        },
      ],
    });

    expect(resultado.success).toBe(false);

    expect(obterMensagensDeErro(resultado, "documentos.0.nome")).toContain(
      Mensagens.campo_obrigatorio,
    );
  });

  it("rejeita documento existente com mais de 255 caracteres", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "",
      documentos: [
        {
          nome: "a".repeat(256),
        },
      ],
    });

    expect(resultado.success).toBe(false);

    expect(obterMensagensDeErro(resultado, "documentos.0.nome")).toContain(
      "O nome do documento deve ter no máximo 255 caracteres.",
    );
  });

  it("aceita documento existente com exatamente 255 caracteres", () => {
    const resultado = cargoSchema.safeParse({
      nome: "Eletricista",
      exige_documento: "true",
      novo_documento: "",
      documentos: [
        {
          nome: "a".repeat(255),
        },
      ],
    });

    expect(resultado.success).toBe(true);
  });
});
