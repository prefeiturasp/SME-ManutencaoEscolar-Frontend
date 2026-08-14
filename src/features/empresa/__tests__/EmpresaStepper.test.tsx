import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmpresaStepper } from "../components/form/EmpresaStepper";

function obterElementosEtapa() {
  const label = screen.getByText(/informações gerais/i);
  const container = label.parentElement;
  const indicador = container?.querySelector("span");

  if (!container || !indicador) {
    throw new Error("Elementos da etapa não encontrados");
  }

  return {
    label,
    container,
    indicador,
  };
}

describe("EmpresaStepper", () => {
  it("deve renderizar a etapa como ativa", () => {
    render(<EmpresaStepper currentStep={0} />);

    const { label, indicador } = obterElementosEtapa();

    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("font-medium", "text-foreground");

    expect(indicador).toHaveClass("border-primary");
    expect(indicador).not.toHaveClass("bg-primary");
    expect(indicador).not.toHaveClass("border-muted-foreground/40");
  });

  it("deve renderizar a etapa como concluída", () => {
    render(<EmpresaStepper currentStep={1} />);

    const { label, indicador } = obterElementosEtapa();

    expect(label).toHaveClass("text-muted-foreground/40");

    expect(indicador).toHaveClass("border-primary", "bg-primary");

    expect(indicador.querySelector("svg")).toBeInTheDocument();
  });

  it("deve renderizar a etapa como futura", () => {
    render(<EmpresaStepper currentStep={-1} />);

    const { label, indicador } = obterElementosEtapa();

    expect(label).toHaveClass("text-muted-foreground/40");

    expect(indicador).toHaveClass("border-muted-foreground/40");

    expect(indicador).not.toHaveClass("border-primary");
    expect(indicador).not.toHaveClass("bg-primary");
    expect(indicador.querySelector("svg")).not.toBeInTheDocument();
  });
});
