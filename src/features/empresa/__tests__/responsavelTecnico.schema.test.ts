import { describe, expect, it } from "vitest";

import {
  responsavelTecnicoSchema,
  RESPONSAVEL_TECNICO_VAZIO,
} from "@/features/empresa/schemas/responsavelTecnico.schema";

describe("responsavelTecnicoSchema", () => {
  const validData = {
    tipo: "engenheiro_civil",
    nome: "João da Silva",
    telefone: "(11) 98765-4321",
    email: "joao.silva@gmail.com",
    numero_crea: "1234567890/A",
    numero_art: "2026/000000-0",
    anexos: [
      new File(["conteudo"], "documento.pdf", { type: "application/pdf" }),
    ],
  };

  it("deve aceitar dados válidos", () => {
    const result = responsavelTecnicoSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it("deve remover a máscara do telefone", () => {
    const result = responsavelTecnicoSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.telefone).toBe("11987654321");
    }
  });

  describe("tipo", () => {
    it("deve rejeitar quando tipo está vazio", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        tipo: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Tipo é obrigatório!");
      }
    });

    it("deve rejeitar tipo fora do enum permitido", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        tipo: "arquiteto",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Tipo inválido!");
      }
    });

    it.each(["preposto", "engenheiro_civil", "engenheiro_eletricista"])(
      "deve aceitar o tipo %s",
      (tipo) => {
        const result = responsavelTecnicoSchema.safeParse({
          ...validData,
          tipo,
        });

        expect(result.success).toBe(true);
      },
    );
  });

  describe("nome", () => {
    it("deve rejeitar quando nome está vazio", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        nome: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Nome completo é obrigatório!",
        );
      }
    });

    it("deve rejeitar nome com mais de 255 caracteres", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        nome: "a".repeat(256),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("email", () => {
    it("deve rejeitar quando e-mail está vazio", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        email: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("E-mail é obrigatório!");
      }
    });

    it("deve rejeitar e-mail inválido", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        email: "invalido",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("E-mail inválido!");
      }
    });
  });

  describe("telefone", () => {
    it("deve aceitar telefone vazio como opcional", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        telefone: "",
      });

      expect(result.success).toBe(true);
    });

    it("deve aceitar telefone undefined como opcional", () => {
      const { telefone: _telefone, ...data } = validData;

      const result = responsavelTecnicoSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("deve aceitar telefone fixo com 10 dígitos", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        telefone: "1133334444",
      });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar telefone com quantidade inválida de dígitos", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        telefone: "123456789",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Telefone inválido!");
      }
    });
  });

  describe("numero_crea e numero_art", () => {
    it("deve aceitar ambos vazios para preposto", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        tipo: "preposto",
        numero_crea: "",
        numero_art: "",
      });

      expect(result.success).toBe(true);
    });

    it("deve aceitar ambos ausentes para preposto", () => {
      const {
        numero_crea: _crea,
        numero_art: _art,
        ...data
      } = { ...validData, tipo: "preposto" };

      const result = responsavelTecnicoSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("deve rejeitar numero_crea com mais de 20 caracteres", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        numero_crea: "a".repeat(21),
      });

      expect(result.success).toBe(false);
    });

    it("deve rejeitar numero_art com mais de 20 caracteres", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        numero_art: "a".repeat(21),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("obrigatoriedade de numero_crea, numero_art e anexos para engenheiros", () => {
    const arquivo = new File(["conteudo"], "documento.pdf", {
      type: "application/pdf",
    });

    it("deve aceitar preposto sem numero_crea, numero_art e anexos", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        tipo: "preposto",
        numero_crea: "",
        numero_art: "",
        anexos: [],
      });

      expect(result.success).toBe(true);
    });

    it.each(["engenheiro_civil", "engenheiro_eletricista"])(
      "deve rejeitar %s sem numero_crea e numero_art, mesmo sem anexos",
      (tipo) => {
        const result = responsavelTecnicoSchema.safeParse({
          ...validData,
          tipo,
          numero_crea: "",
          numero_art: "",
          anexos: [],
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          const mensagens = result.error.issues.map((issue) => issue.message);
          expect(mensagens).toContain("Número do CREA-SP é obrigatório!");
          expect(mensagens).toContain("Número da ART é obrigatório!");
        }
      },
    );

    it.each(["engenheiro_civil", "engenheiro_eletricista"])(
      "deve aceitar %s sem anexos quando numero_crea e numero_art estão preenchidos",
      (tipo) => {
        const result = responsavelTecnicoSchema.safeParse({
          ...validData,
          tipo,
          anexos: [],
        });

        expect(result.success).toBe(true);
      },
    );

    it("deve rejeitar engenheiro sem numero_crea informado", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        tipo: "engenheiro_civil",
        numero_crea: "",
        anexos: [arquivo],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) => issue.message === "Número do CREA-SP é obrigatório!",
          ),
        ).toBe(true);
      }
    });

    it("deve rejeitar engenheiro sem numero_art informado", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        tipo: "engenheiro_civil",
        numero_art: "",
        anexos: [arquivo],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) => issue.message === "Número da ART é obrigatório!",
          ),
        ).toBe(true);
      }
    });

    it("deve aceitar engenheiro com numero_crea, numero_art e anexos preenchidos", () => {
      const result = responsavelTecnicoSchema.safeParse({
        ...validData,
        tipo: "engenheiro_eletricista",
        anexos: [arquivo],
      });

      expect(result.success).toBe(true);
    });
  });

  describe("RESPONSAVEL_TECNICO_VAZIO", () => {
    it("deve representar um item vazio válido para o formulário", () => {
      expect(RESPONSAVEL_TECNICO_VAZIO).toEqual({
        tipo: "",
        nome: "",
        telefone: "",
        email: "",
        numero_crea: "",
        numero_art: "",
        anexos: [],
      });
    });
  });
});
