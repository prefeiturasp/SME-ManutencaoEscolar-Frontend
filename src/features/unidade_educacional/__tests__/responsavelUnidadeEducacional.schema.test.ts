import { describe, expect, it } from "vitest";

import { responsavelUnidadeEducacionalSchema } from "@/features/unidade_educacional/schemas/responsavelUnidadeEducacional.schema";

describe("responsavelUnidadeEducacionalSchema", () => {
  const RESPONSAVEL_VALIDO = {
    registro_funcional: "1234567",
    nome: "João da Silva",
    cargo: "DIRETOR",
    email: "joao@example.com",
    telefone: "",
    celular: "",
    criado_pelo_sincronizador: false,
  };

  describe("dados válidos", () => {
    it("deve aceitar um responsável válido", () => {
      const result =
        responsavelUnidadeEducacionalSchema.safeParse(
          RESPONSAVEL_VALIDO,
        );

      expect(result.success).toBe(true);
    });
  });

  describe("registro_funcional", () => {
    it("deve aceitar registro funcional com 7 dígitos", () => {
      const result =
        responsavelUnidadeEducacionalSchema.safeParse({
          ...RESPONSAVEL_VALIDO,
          registro_funcional: "1234567",
        });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar registro funcional inválido", () => {
      const result =
        responsavelUnidadeEducacionalSchema.safeParse({
          ...RESPONSAVEL_VALIDO,
          registro_funcional: "123456",
        });

      expect(result.success).toBe(false);
    });
  });

  describe("nome", () => {
    it("deve aceitar nome preenchido", () => {
      const result =
        responsavelUnidadeEducacionalSchema.safeParse({
          ...RESPONSAVEL_VALIDO,
          nome: "Maria da Silva",
        });

      expect(result.success).toBe(true);
    });
  });

  describe("cargo", () => {
    it("deve aceitar cargo preenchido", () => {
      const result =
        responsavelUnidadeEducacionalSchema.safeParse({
          ...RESPONSAVEL_VALIDO,
          cargo: "DIRETOR",
        });

      expect(result.success).toBe(true);
    });
  });

  describe("email", () => {
    it("deve aceitar e-mail válido", () => {
      const result =
        responsavelUnidadeEducacionalSchema.safeParse({
          ...RESPONSAVEL_VALIDO,
          email: "maria@example.com",
        });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar e-mail inválido", () => {
      const result =
        responsavelUnidadeEducacionalSchema.safeParse({
          ...RESPONSAVEL_VALIDO,
          email: "email-invalido",
        });

      expect(result.success).toBe(false);
    });
  });

  describe("telefone", () => {
    it("deve aceitar telefone com 10 dígitos", () => {
      const result =
        responsavelUnidadeEducacionalSchema.safeParse({
          ...RESPONSAVEL_VALIDO,
          telefone: "1133334444",
        });

      expect(result.success).toBe(true);
    });

    it("deve aceitar telefone com 11 dígitos", () => {
      const result =
        responsavelUnidadeEducacionalSchema.safeParse({
          ...RESPONSAVEL_VALIDO,
          telefone: "11987654321",
        });

      expect(result.success).toBe(true);
    });

    it("deve aceitar telefone vazio", () => {
      const result =
        responsavelUnidadeEducacionalSchema.safeParse({
          ...RESPONSAVEL_VALIDO,
          telefone: "",
        });

      expect(result.success).toBe(true);
    });
  });

  describe("celular", () => {
    it("deve aceitar celular com 11 dígitos", () => {
      const result =
        responsavelUnidadeEducacionalSchema.safeParse({
          ...RESPONSAVEL_VALIDO,
          celular: "11987654321",
        });

      expect(result.success).toBe(true);
    });
  });

  describe("criado_pelo_sincronizador", () => {
    it.each([true, false])(
      "deve aceitar criado_pelo_sincronizador como %s",
      (criadoPeloSincronizador) => {
        const result =
          responsavelUnidadeEducacionalSchema.safeParse({
            ...RESPONSAVEL_VALIDO,
            criado_pelo_sincronizador: criadoPeloSincronizador,
          });

        expect(result.success).toBe(true);
      },
    );
  });
});