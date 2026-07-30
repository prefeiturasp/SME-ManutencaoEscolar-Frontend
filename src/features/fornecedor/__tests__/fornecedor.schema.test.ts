import { describe, expect, it } from "vitest";

import {
  fornecedorSchema,
  type FornecedorSchema,
} from "@/features/fornecedor/schemas/fornecedor.schema";

describe("fornecedorSchema", () => {
  const validData = {
    nome: "Empresa XYZ",
    cnpj: "11444777000161",
    status: true,
    razao_social: "Empresa XYZ LTDA",
    link_rastreio: "https://rastreio.example.com",
    cep: "01310100",
    logradouro: "Avenida Paulista",
    numero: "1000",
    complemento: "Sala 100",
    cidade: "São Paulo",
    estado: "SP",
  };

  describe("validação de campos obrigatórios", () => {
    it("deve aceitar dados válidos", () => {
      const result = fornecedorSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("deve rejeitar quando status não informado", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        status: undefined,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Status é obrigatório!");
      }
    });

    it("deve rejeitar quando nome está vazio", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        nome: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Nome é obrigatório!");
      }
    });

    it("deve rejeitar quando razão social está vazia", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        razao_social: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Razão social é obrigatória!",
        );
      }
    });

    it("deve rejeitar quando logradouro está vazio", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        logradouro: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Logradouro é obrigatório!",
        );
      }
    });

    it("deve rejeitar quando número está vazio", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        numero: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Número é obrigatório!");
      }
    });

    it("deve rejeitar quando cidade está vazia", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        cidade: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Cidade é obrigatória!");
      }
    });
  });

  describe("validação de CNPJ", () => {
    it("deve aceitar CNPJ válido", () => {
      const result = fornecedorSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("deve aceitar CNPJ com máscara", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        cnpj: "11.444.777/0001-61",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cnpj).toBe("11444777000161");
      }
    });

    it("deve rejeitar CNPJ inválido", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        cnpj: "abcdefghijklmn", // Não segue padrão [A-Z0-9]{12}\d{2}
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("CNPJ deve conter 14 dígitos!");
      }
    });

    it("deve rejeitar CNPJ com menos de 14 caracteres", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        cnpj: "123456789012",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("CNPJ deve conter 14 dígitos!");
      }
    });
  });

  describe("validação de CEP", () => {
    it("deve aceitar CEP válido", () => {
      const result = fornecedorSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("deve aceitar CEP com máscara", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        cep: "01310-100",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cep).toBe("01310100");
      }
    });

    it("deve rejeitar CEP com menos de 8 dígitos", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        cep: "0131010",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "CEP deve conter 8 dígitos!",
        );
      }
    });
  });

  describe("validação de link_rastreio", () => {
    it("deve aceitar link HTTPS válido", () => {
      const result = fornecedorSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("deve aceitar link_rastreio vazio como opcional", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        link_rastreio: "",
      });

      expect(result.success).toBe(true);
    });

    it("deve aceitar link_rastreio undefined como opcional", () => {
      const { link_rastreio, ...data } = validData;

      const result = fornecedorSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("deve rejeitar link HTTP", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        link_rastreio: "http://rastreio.example.com",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'O link deve começar com "https://"!',
        );
      }
    });

    it("deve rejeitar link sem protocolo", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        link_rastreio: "rastreio.example.com",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'O link deve começar com "https://"!',
        );
      }
    });
  });

  describe("validação de estado", () => {
    it("deve aceitar estado válido", () => {
      const result = fornecedorSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("deve rejeitar estado inválido", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        estado: "XX",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Estado inválido!");
      }
    });

    it("deve aceitar todos os estados brasileiros", () => {
      const estados = [
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
      ];

      for (const estado of estados) {
        const result = fornecedorSchema.safeParse({
          ...validData,
          estado,
        });

        expect(result.success).toBe(true, `Estado ${estado} deve ser válido`);
      }
    });
  });

  describe("validação de comprimento de campos", () => {
    it("deve rejeitar nome com mais de 255 caracteres", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        nome: "a".repeat(256),
      });

      expect(result.success).toBe(false);
    });

    it("deve rejeitar razão social com mais de 255 caracteres", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        razao_social: "a".repeat(256),
      });

      expect(result.success).toBe(false);
    });

    it("deve rejeitar logradouro com mais de 255 caracteres", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        logradouro: "a".repeat(256),
      });

      expect(result.success).toBe(false);
    });

    it("deve rejeitar número com mais de 10 caracteres", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        numero: "12345678901",
      });

      expect(result.success).toBe(false);
    });

    it("deve rejeitar cidade com mais de 100 caracteres", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        cidade: "a".repeat(101),
      });

      expect(result.success).toBe(false);
    });

    it("deve rejeitar link_rastreio com mais de 255 caracteres", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        link_rastreio: `https://${"a".repeat(300)}.com`,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("validação de status", () => {
    it("deve aceitar status true", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        status: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(true);
      }
    });

    it("deve aceitar status false", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        status: false,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(false);
      }
    });

    it("deve rejeitar quando status não fornecido", () => {
      const { status, ...data } = validData;

      const result = fornecedorSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Status é obrigatório!");
      }
    });
  });

  describe("validação de complemento", () => {
    it("deve aceitar complemento preenchido", () => {
      const result = fornecedorSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("deve aceitar complemento vazio", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        complemento: "",
      });

      expect(result.success).toBe(true);
    });

    it("deve aceitar complemento undefined", () => {
      const { complemento, ...data } = validData;

      const result = fornecedorSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("deve rejeitar complemento com mais de 255 caracteres", () => {
      const result = fornecedorSchema.safeParse({
        ...validData,
        complemento: "a".repeat(256),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("type inference", () => {
    it("deve ter tipos corretos inferidos do schema", () => {
      const data: FornecedorSchema = {
        nome: "Empresa",
        cnpj: "11444777000161",
        status: true,
        razao_social: "Empresa LTDA",
        link_rastreio: "https://example.com",
        cep: "01310100",
        logradouro: "Rua",
        numero: "123",
        complemento: "Apt",
        cidade: "São Paulo",
        estado: "SP",
      };

      expect(data).toBeDefined();
    });
  });
});
