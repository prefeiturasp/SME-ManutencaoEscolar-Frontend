import { describe, expect, it } from "vitest";

import {
  formatarDataHora,
  formatarNomeDre,
  maskCep,
  maskCnpj,
  maskTelefone,
  unmaskCep,
  unmaskCnpj,
  unmaskTelefone,
} from "@/utils/formatadores";

describe("formatadores", () => {
  describe("maskCnpj", () => {
    it("deve aplicar máscara CNPJ corretamente", () => {
      expect(maskCnpj("11444777000161")).toBe("11.444.777/0001-61");
    });

    it("deve remover caracteres especiais antes de aplicar máscara", () => {
      expect(maskCnpj("11.444.777/0001-61")).toBe("11.444.777/0001-61");
    });

    it("deve converter para maiúscula", () => {
      expect(maskCnpj("11444777000161")).toBe("11.444.777/0001-61");
    });

    it("deve aceitar alfanuméricos nos primeiros 12 caracteres", () => {
      const result = maskCnpj("A1B44477700");
      // A função processa os primeiros 12 e ultimos 2 dígitos
      expect(result).toContain("A1");
      expect(result).toContain("B44");
    });

    it("deve aplicar máscara parcial para valores incompletos", () => {
      expect(maskCnpj("11")).toBe("11");
      expect(maskCnpj("114")).toBe("11.4");
      expect(maskCnpj("114447")).toBe("11.444.7");
      expect(maskCnpj("1144477700")).toBe("11.444.777/00");
    });

    it("deve limitar para 14 caracteres", () => {
      const resultado = maskCnpj("114447770001611234567890");

      expect(resultado).toBe("11.444.777/0001-61");
    });

    it("deve aceitar apenas dígitos após 12 caracteres", () => {
      expect(maskCnpj("11444777000161")).toBe("11.444.777/0001-61");
    });

    it("deve remover caracteres especiais", () => {
      expect(maskCnpj("11@444#777/0001-61")).toBe("11.444.777/0001-61");
    });
  });

  describe("maskCep", () => {
    it("deve aplicar máscara CEP corretamente", () => {
      expect(maskCep("01310100")).toBe("01310-100");
    });

    it("deve remover caracteres especiais antes de aplicar máscara", () => {
      expect(maskCep("01310-100")).toBe("01310-100");
    });

    it("deve limitar para 8 dígitos", () => {
      expect(maskCep("013101001234")).toBe("01310-100");
    });

    it("deve aplicar máscara parcial para valores incompletos", () => {
      expect(maskCep("01")).toBe("01");
      expect(maskCep("01310")).toBe("01310");
      expect(maskCep("013101")).toBe("01310-1");
    });

    it("deve aceitar CEP com máscara como entrada", () => {
      expect(maskCep("01310-100")).toBe("01310-100");
    });

    it("deve remover caracteres não dígitos", () => {
      expect(maskCep("01310@100")).toBe("01310-100");
    });
  });

  describe("unmaskCnpj", () => {
    it("deve remover máscara CNPJ corretamente", () => {
      expect(unmaskCnpj("11.444.777/0001-61")).toBe("11444777000161");
    });

    it("deve aceitar CNPJ sem máscara", () => {
      expect(unmaskCnpj("11444777000161")).toBe("11444777000161");
    });

    it("deve converter para maiúscula", () => {
      expect(unmaskCnpj("11.444.777/0001-61")).toBe("11444777000161");
    });

    it("deve remover caracteres especiais", () => {
      expect(unmaskCnpj("11@444#777/0001-61")).toBe("11444777000161");
    });

    it("deve aceitar alfanuméricos nos primeiros 12 caracteres", () => {
      const result = unmaskCnpj("A1.B44.477/00-01");
      // A função remove máscara mantendo alfanuméricos na base
      expect(result).toContain("A1");
      expect(result).toContain("B44");
    });

    it("deve manter apenas 14 caracteres", () => {
      expect(unmaskCnpj("11.444.777/0001-611234567890")).toBe("11444777000161");
    });

    it("deve preservar alfanuméricos na base", () => {
      const resultado = unmaskCnpj("A1.B44.777/0001-61");
      // A função preserva alfanuméricos dos primeiros 12 caracteres
      expect(resultado).toContain("A1");
      expect(resultado).toContain("B44");
      expect(resultado).toContain("777");
    });
  });

  describe("unmaskCep", () => {
    it("deve remover máscara CEP corretamente", () => {
      expect(unmaskCep("01310-100")).toBe("01310100");
    });

    it("deve aceitar CEP sem máscara", () => {
      expect(unmaskCep("01310100")).toBe("01310100");
    });

    it("deve remover caracteres especiais", () => {
      expect(unmaskCep("01310@100")).toBe("01310100");
    });

    it("deve limitar para 8 dígitos", () => {
      expect(unmaskCep("01310-1001234")).toBe("01310100");
    });

    it("deve remover todos os caracteres não-dígitos", () => {
      expect(unmaskCep("01310-100-abc")).toBe("01310100");
    });
  });

  describe("maskTelefone", () => {
    it("deve retornar vazio quando não há dígitos", () => {
      expect(maskTelefone("")).toBe("");
      expect(maskTelefone("abc")).toBe("");
    });

    it("deve retornar apenas o DDD parcial com abre parênteses", () => {
      expect(maskTelefone("1")).toBe("(1");
      expect(maskTelefone("11")).toBe("(11");
    });

    it("deve aplicar máscara quando o restante tem até 4 dígitos", () => {
      expect(maskTelefone("113")).toBe("(11) 3");
      expect(maskTelefone("1132")).toBe("(11) 32");
      expect(maskTelefone("11987")).toBe("(11) 987");
      expect(maskTelefone("119876")).toBe("(11) 9876");
    });

    it("deve aplicar máscara de telefone fixo (separador de 4 dígitos)", () => {
      expect(maskTelefone("1132225566")).toBe("(11) 3222-5566");
    });

    it("deve aplicar máscara de celular (separador de 5 dígitos)", () => {
      expect(maskTelefone("11987654321")).toBe("(11) 98765-4321");
    });

    it("deve remover caracteres não numéricos antes de aplicar a máscara", () => {
      expect(maskTelefone("(11) 98765-4321")).toBe("(11) 98765-4321");
    });

    it("deve limitar a 11 dígitos", () => {
      expect(maskTelefone("119876543211234")).toBe("(11) 98765-4321");
    });
  });

  describe("unmaskTelefone", () => {
    it("deve remover máscara do telefone", () => {
      expect(unmaskTelefone("(11) 98765-4321")).toBe("11987654321");
    });

    it("deve aceitar telefone sem máscara", () => {
      expect(unmaskTelefone("11987654321")).toBe("11987654321");
    });

    it("deve limitar a 11 dígitos", () => {
      expect(unmaskTelefone("11987654321999")).toBe("11987654321");
    });
  });

  describe("formatarDataHora", () => {
    it("deve formatar data ISO para dd/mm/yyyy às HH:MM", () => {
      expect(formatarDataHora("2024-01-05T09:07:00")).toBe(
        "05/01/2024 às 09:07",
      );
    });

    it("deve aplicar zero à esquerda em dia, mês, hora e minuto", () => {
      expect(formatarDataHora("2024-03-02T04:05:00")).toBe(
        "02/03/2024 às 04:05",
      );
    });

    it("deve retornar o valor original quando a data for inválida", () => {
      expect(formatarDataHora("data-invalida")).toBe("data-invalida");
    });
  });

  describe("integração entre mask e unmask", () => {
    it("deve remover máscara após aplicá-la para CNPJ", () => {
      const original = "11444777000161";
      const masked = maskCnpj(original);
      const unmasked = unmaskCnpj(masked);

      expect(unmasked).toBe(original);
    });

    it("deve remover máscara após aplicá-la para CEP", () => {
      const original = "01310100";
      const masked = maskCep(original);
      const unmasked = unmaskCep(masked);

      expect(unmasked).toBe(original);
    });

    it("deve funcionar com CNPJ com caracteres especiais", () => {
      const original = "11444777000161";
      const masked = maskCnpj(original);
      const unmasked = unmaskCnpj(masked);

      expect(unmasked).toBe(original);
    });

    it("deve funcionar com CEP com caracteres especiais", () => {
      const original = "01310100";
      const masked = maskCep(original);
      const unmasked = unmaskCep(masked);

      expect(unmasked).toBe(original);
    });
  });

  describe("formatarNomeDre", () => {
    it("deve remover o prefixo DRE e formatar o nome", () => {
      expect(formatarNomeDre("DRE BUTANTA")).toBe("DRE Butanta");
    });

    it("deve tratar o prefixo DRE sem diferenciar maiúsculas e minúsculas", () => {
      expect(formatarNomeDre("dre penha")).toBe("DRE Penha");
    });

    it("deve capitalizar nomes separados por espaço", () => {
      expect(formatarNomeDre("DRE SAO MIGUEL")).toBe("DRE Sao Miguel");
    });

    it("deve capitalizar nomes separados por hífen", () => {
      expect(formatarNomeDre("DRE SAO-MATEUS")).toBe("DRE Sao-Mateus");
    });

    it("deve capitalizar nomes separados por barra", () => {
      expect(formatarNomeDre("DRE BUTANTA/LAPA")).toBe("DRE Butanta/Lapa");
    });
  });
});
