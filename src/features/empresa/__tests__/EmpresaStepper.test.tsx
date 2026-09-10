import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmpresaStepper } from "../components/form/EmpresaStepper";

function obterElementosEtapa(nome: RegExp = /informações gerais/i) {
  const label = screen.getByText(nome);
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
  it("deve renderizar a etapa como ativa sem campos preenchidos", () => {
    render(<EmpresaStepper currentStep={0} />);

    const { label, indicador } = obterElementosEtapa();

    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("font-medium", "text-foreground");

    expect(indicador).toHaveClass("border-primary", "bg-white");
    expect(indicador).not.toHaveClass("bg-primary", "border-muted-foreground/40");

    expect(indicador.querySelector("svg")).not.toBeInTheDocument();
  });

  it("deve preencher a etapa ativa quando os campos estão preenchidos", () => {
    render(
      <EmpresaStepper currentStep={0} campos_preenchidos={[true, false]} />,
    );

    const { label, indicador } = obterElementosEtapa();

    expect(label).toHaveClass("font-medium", "text-foreground");

    expect(indicador).toHaveClass("border-primary", "bg-primary");
    expect(indicador).not.toHaveClass("border-muted-foreground/40", "bg-white");

    const check = indicador.querySelector("svg");
    expect(check).toBeInTheDocument();
    expect(check).toHaveClass("text-white");
  });

  it("deve renderizar a etapa como concluída quando preenchida e não ativa", () => {
    render(<EmpresaStepper currentStep={1} campos_preenchidos={[true, true]} />);

    const { label, indicador } = obterElementosEtapa();

    expect(label).toHaveClass("text-foreground");
    expect(label).not.toHaveClass("text-muted-foreground/40");

    expect(indicador).toHaveClass("border-primary", "bg-primary");
    expect(indicador).not.toHaveClass("bg-white", "border-muted-foreground/40");

    const check = indicador.querySelector("svg");
    expect(check).toBeInTheDocument();
    expect(check).toHaveClass("text-white");
  });

  it("deve renderizar todas as etapas como concluídas quando todos os campos estão preenchidos", () => {
    render(<EmpresaStepper currentStep={0} campos_preenchidos={[true, true]} />);

    const etapaAtiva = obterElementosEtapa(/informações gerais/i);
    expect(etapaAtiva.indicador).toHaveClass("border-primary", "bg-primary");
    expect(etapaAtiva.indicador.querySelector("svg")).toBeInTheDocument();

    const etapaConcluida = obterElementosEtapa(/responsável técnico/i);
    expect(etapaConcluida.indicador).toHaveClass("border-primary", "bg-primary");
    expect(etapaConcluida.label).toHaveClass("text-foreground");
    expect(etapaConcluida.indicador.querySelector("svg")).toBeInTheDocument();
  });

  it("deve destacar as etapas preenchidas com estilos distintos no modo de edição", () => {
    render(
      <EmpresaStepper currentStep={0} campos_preenchidos={[true, true]} modoEdicao />,
    );

    const etapaAtiva = obterElementosEtapa(/informações gerais/i);
    expect(etapaAtiva.label).toHaveClass("text-foreground");
    expect(etapaAtiva.indicador).toHaveClass("border-primary", "bg-primary");
    expect(etapaAtiva.indicador.querySelector("svg")).toHaveClass("text-white");

    const etapaInativa = obterElementosEtapa(/responsável técnico/i);
    expect(etapaInativa.label).toHaveClass("text-foreground");
    expect(etapaInativa.indicador).toHaveClass("border-primary", "bg-white");
    expect(etapaInativa.indicador).not.toHaveClass("bg-primary");
    expect(etapaInativa.indicador.querySelector("svg")).toHaveClass("text-primary");
  });

  it("deve destacar a etapa inativa sem check quando não preenchida no modo de edição", () => {
    render(<EmpresaStepper currentStep={0} modoEdicao />);

    const { label, indicador } = obterElementosEtapa(/responsável técnico/i);

    expect(label).toHaveClass("text-foreground");
    expect(indicador).toHaveClass("border-primary", "bg-white");
    expect(indicador.querySelector("svg")).not.toBeInTheDocument();
  });

  it("deve renderizar a etapa como futura", () => {
    render(<EmpresaStepper currentStep={-1} />);

    const { label, indicador } = obterElementosEtapa();

    expect(label).toHaveClass("text-muted-foreground/40");

    expect(indicador).toHaveClass("border-muted-foreground/40", "bg-white");

    expect(indicador).not.toHaveClass("border-primary");
    expect(indicador).not.toHaveClass("bg-primary");
    expect(indicador.querySelector("svg")).not.toBeInTheDocument();
  });
});
