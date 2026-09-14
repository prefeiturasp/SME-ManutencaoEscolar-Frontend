import { describe, expect, it } from "vitest";

import {
  unidadeEducacionalSchema,
  type UnidadeEducacionalSchema,
} from "@/features/unidade_educacional/schemas/unidadesEducacionais.schema";

describe("unidadeEducacionalSchema", () => {
  const validData = {
    codigo_eol: "400509",
    tipo_escola: "CCI/CIPS",
    diretoria_regional: "DRE IPIRANGA",
    nome: "CCI/CIPS CAMARA MUNICIPAL DE SAO PAULO",
    subprefeitura: "SE",
    lote: "Lote 2025/2027",
    status: "true",
    telefone: "(11) 99999-9999",
    email: "unidade@example.com",
    cep: "01310-100",
    logradouro: "Avenida Paulista",
    numero: "1000",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
  };

  describe("validação de dados válidos", () => {
    it("deve aceitar dados válidos", () => {
      const result = unidadeEducacionalSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe("codigo_eol", () => {
    it("deve rejeitar quando código EOL está vazio", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        codigo_eol: "",
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "CODESC é obrigatório!",
        );
      }
    });

    it("deve rejeitar código EOL com mais de 6 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        codigo_eol: "1234567",
      });

      expect(result.success).toBe(false);
    });

    it("deve aceitar código EOL com 6 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        codigo_eol: "123456",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("tipo_escola", () => {
    it("deve rejeitar quando tipo de escola está vazio", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        tipo_escola: "",
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Tipo de escola é obrigatório!",
        );
      }
    });
  });

  describe("diretoria_regional", () => {
    it("deve rejeitar quando diretoria regional está vazia", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        diretoria_regional: "",
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Diretoria Regional é obrigatória!",
        );
      }
    });
  });

  describe("nome", () => {
    it("deve rejeitar quando nome está vazio", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        nome: "",
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Nome da unidade é obrigatório!",
        );
      }
    });

    it("deve rejeitar nome com mais de 300 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        nome: "a".repeat(301),
      });

      expect(result.success).toBe(false);
    });

    it("deve aceitar nome com 300 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        nome: "a".repeat(300),
      });

      expect(result.success).toBe(true);
    });
  });

  describe("subprefeitura", () => {
    it("deve rejeitar quando subprefeitura está vazia", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        subprefeitura: "",
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Subprefeitura é obrigatória!",
        );
      }
    });
  });

  describe("lote", () => {
    it("deve aceitar lote vazio", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        lote: "",
      });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar lote com mais de 200 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        lote: "a".repeat(201),
      });

      expect(result.success).toBe(false);
    });

    it("deve aceitar lote com 200 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        lote: "a".repeat(200),
      });

      expect(result.success).toBe(true);
    });
  });


  describe("email", () => {
    it("deve aceitar e-mail válido", () => {
      const result = unidadeEducacionalSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("deve aceitar e-mail vazio", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        email: "",
      });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar e-mail inválido", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        email: "email-invalido",
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "E-mail inválido!",
        );
      }
    });

    it("deve rejeitar e-mail com mais de 255 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        email: `${"a".repeat(245)}@example.com`,
      });

      expect(result.success).toBe(false);
    });
  });


  describe("logradouro", () => {
    it("deve aceitar logradouro vazio", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        logradouro: "",
      });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar logradouro com mais de 255 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        logradouro: "a".repeat(256),
      });

      expect(result.success).toBe(false);
    });

    it("deve aceitar logradouro com 255 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        logradouro: "a".repeat(255),
      });

      expect(result.success).toBe(true);
    });
  });

  describe("numero", () => {
    it("deve aceitar número vazio", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        numero: "",
      });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar número com mais de 10 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        numero: "1".repeat(11),
      });

      expect(result.success).toBe(false);
    });

    it("deve aceitar número com 10 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        numero: "1".repeat(10),
      });

      expect(result.success).toBe(true);
    });
  });

  describe("bairro", () => {
    it("deve aceitar bairro vazio", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        bairro: "",
      });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar bairro com mais de 100 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        bairro: "a".repeat(101),
      });

      expect(result.success).toBe(false);
    });

    it("deve aceitar bairro com 100 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        bairro: "a".repeat(100),
      });

      expect(result.success).toBe(true);
    });
  });

  describe("cidade", () => {
    it("deve aceitar cidade vazia", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        cidade: "",
      });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar cidade com mais de 100 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        cidade: "a".repeat(101),
      });

      expect(result.success).toBe(false);
    });

    it("deve aceitar cidade com 100 caracteres", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        cidade: "a".repeat(100),
      });

      expect(result.success).toBe(true);
    });
  });

  describe("status", () => {
  it.each([
    ["true", true],
    ["false", false],
  ])(
    "deve converter status %s para boolean %s",
    (status, esperado) => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        status,
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.status).toBe(esperado);
      }
    },
  );

  it.each([
    [undefined, "Status é obrigatório!"],
    ["ativo", "Status é obrigatório!"],
  ])(
    "deve rejeitar status inválido %s",
    (status, mensagem) => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        status,
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(mensagem);
      }
    },
  );
  });

  describe("telefone", () => {
    it("deve remover a máscara do telefone", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        telefone: "(11) 98765-4321",
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.telefone).toBe("11987654321");
      }
    });

    it.each([
      ["", true],
      ["1133334444", true],
      ["11987654321", true],
      ["123456789", false],
    ])("deve validar o telefone %s", (telefone, esperado) => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        telefone,
      });

      expect(result.success).toBe(esperado);
    });

    it("deve retornar a mensagem correta para telefone inválido", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        telefone: "123456789",
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Telefone inválido!",
        );
      }
    });
  });

  describe("cep", () => {
    it("deve remover a máscara do CEP", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        cep: "01310-100",
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.cep).toBe("01310100");
      }
    });

    it.each([
      ["01310100", true],
      ["01310-100", true],
      ["0131010", false],
      ["abcdefgh", false],
    ])("deve validar o CEP %s", (cep, esperado) => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        cep,
      });

      expect(result.success).toBe(esperado);
    });

    it("deve rejeitar quando CEP está vazio", () => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        cep: "",
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "CEP é obrigatório!",
        );
      }
    });

    it.each(["0131010", "abcdefgh"])(
      "deve retornar mensagem correta para CEP inválido %s",
      (cep) => {
        const result = unidadeEducacionalSchema.safeParse({
          ...validData,
          cep,
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "CEP deve conter 8 dígitos!",
          );
        }
      },
    );
  });

  describe("estado", () => {
    it.each([
      "AC",
      "AL",
      "AP",
      "AM",
      "BA",
      "CE",
      "DF",
      "ES",
      "GO",
      "MA",
      "MT",
      "MS",
      "MG",
      "PA",
      "PB",
      "PR",
      "PE",
      "PI",
      "RJ",
      "RN",
      "RS",
      "RO",
      "RR",
      "SC",
      "SP",
      "SE",
      "TO",
    ])("deve aceitar o estado %s", (estado) => {
      const result = unidadeEducacionalSchema.safeParse({
        ...validData,
        estado,
      });

      expect(result.success).toBe(true);
    });

    it.each([
      ["XX", "Estado inválido!"],
      ["", "Estado inválido!"],
      ["São Paulo", "Estado inválido!"],
    ])(
      "deve rejeitar o estado inválido %s",
      (estado, mensagem) => {
        const result = unidadeEducacionalSchema.safeParse({
          ...validData,
          estado,
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error.issues[0].message).toBe(mensagem);
        }
      },
    );
  });

  describe("type inference", () => {
    it("deve ter tipos corretos inferidos do schema", () => {
      const data: UnidadeEducacionalSchema = {
        codigo_eol: "400509",
        tipo_escola: "CCI/CIPS",
        diretoria_regional: "DRE IPIRANGA",
        nome: "Unidade Educacional",
        subprefeitura: "SE",
        lote: "Lote 2025/2027",
        status: "true",
        telefone: "11999999999",
        email: "unidade@example.com",
        cep: "01310100",
        logradouro: "Avenida Paulista",
        numero: "1000",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "SP",
      };

      expect(data).toBeDefined();
    });
  });
});