import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  calcularDiasParaVencimento,
  deveExibirAvisoVencimento,
} from "@/utils/vencimentoLote";

describe("calcularDiasParaVencimento", () => {
  beforeEach(() => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2026-09-03T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("deve retornar null quando a data for undefined", () => {
    expect(calcularDiasParaVencimento(undefined)).toBeNull();
  });

  it("deve retornar null quando a data for null", () => {
    expect(calcularDiasParaVencimento(null)).toBeNull();
  });

  it("deve retornar null quando a data estiver vazia", () => {
    expect(calcularDiasParaVencimento("")).toBeNull();
  });

  it("deve retornar null quando a data for inválida", () => {
    expect(calcularDiasParaVencimento("data-invalida")).toBeNull();
  });

  it("deve retornar zero quando o vencimento for hoje", () => {
    expect(calcularDiasParaVencimento("2026-09-03")).toBe(0);
  });

  it("deve calcular os dias restantes", () => {
    expect(calcularDiasParaVencimento("2026-09-05")).toBe(2);
  });

  it("deve calcular noventa dias restantes", () => {
    expect(calcularDiasParaVencimento("2026-12-02")).toBe(90);
  });

  it("deve retornar número negativo para data vencida", () => {
    expect(calcularDiasParaVencimento("2026-09-01")).toBe(-2);
  });

  it("deve ignorar o horário atual no cálculo", () => {
    vi.setSystemTime(new Date("2026-09-03T23:59:59"));

    expect(calcularDiasParaVencimento("2026-09-04")).toBe(1);
  });
});

describe("deveExibirAvisoVencimento", () => {
  it("deve retornar false quando os dias forem null", () => {
    expect(deveExibirAvisoVencimento(null)).toBe(false);
  });

  it("deve retornar false quando a licitação já tiver vencido", () => {
    expect(deveExibirAvisoVencimento(-1)).toBe(false);
  });

  it("deve retornar true quando o vencimento for hoje", () => {
    expect(deveExibirAvisoVencimento(0)).toBe(true);
  });

  it("deve retornar true quando faltar um dia", () => {
    expect(deveExibirAvisoVencimento(1)).toBe(true);
  });

  it("deve retornar true quando faltarem noventa dias", () => {
    expect(deveExibirAvisoVencimento(90)).toBe(true);
  });

  it("deve retornar false quando faltarem mais de noventa dias", () => {
    expect(deveExibirAvisoVencimento(91)).toBe(false);
  });
});
