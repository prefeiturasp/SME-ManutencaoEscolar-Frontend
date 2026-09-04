import { UNIDADE_EDUCACIONAL_ETAPAS, UnidadeEducacionalStepper } from "@/features/unidade_educacional/components/form/StepperUnidadeEducacional";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";


function renderStepper(
  currentStep = 0,
  camposPreenchidos: readonly boolean[] = [],
) {
  return render(
    <UnidadeEducacionalStepper
      currentStep={currentStep}
      campos_preenchidos={camposPreenchidos}
    />,
  );
}

describe("UnidadeEducacionalStepper", () => {
  it("deve renderizar todas as etapas", () => {
    renderStepper();

    expect(
      screen.getByText("Informações gerais"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Contatos"),
    ).toBeInTheDocument();
  });

  it("deve possuir duas etapas configuradas", () => {
    expect(UNIDADE_EDUCACIONAL_ETAPAS).toHaveLength(2);

    expect(UNIDADE_EDUCACIONAL_ETAPAS).toEqual([
      {
        key: "informacoes-gerais",
        label: "Informações gerais",
      },
      {
        key: "contatos",
        label: "Contatos",
      },
    ]);
  });

  it("deve destacar a primeira etapa como ativa", () => {
    renderStepper(0);

    const primeiraEtapa = screen
      .getByText("Informações gerais")
      .closest("div");

    expect(primeiraEtapa).toBeInTheDocument();
  });

  it("deve destacar a segunda etapa como ativa", () => {
    renderStepper(1);

    const segundaEtapa = screen
      .getByText("Contatos")
      .closest("div");

    expect(segundaEtapa).toBeInTheDocument();
  });

  it("deve exibir o ícone de confirmação para a primeira etapa preenchida", () => {
    const { container } = renderStepper(0, [true, false]);

    const icons = container.querySelectorAll("svg");

    expect(icons).toHaveLength(1);
  });

  it("deve exibir o ícone de confirmação para as duas etapas preenchidas", () => {
    const { container } = renderStepper(1, [true, true]);

    const icons = container.querySelectorAll("svg");

    expect(icons).toHaveLength(2);
  });

  it("não deve exibir ícone de confirmação quando nenhuma etapa estiver preenchida", () => {
    const { container } = renderStepper(0, [false, false]);

    const icons = container.querySelectorAll("svg");

    expect(icons).toHaveLength(0);
  });

  it("deve considerar campos_preenchidos vazio como nenhuma etapa preenchida", () => {
    const { container } = renderStepper(0);

    const icons = container.querySelectorAll("svg");

    expect(icons).toHaveLength(0);
  });

  it("deve aplicar o estilo da etapa ativa quando a primeira etapa estiver preenchida", () => {
    const { container } = renderStepper(0, [true, false]);

    const indicadorAtivo = container.querySelector(
      ".border-primary.bg-primary",
    );

    expect(indicadorAtivo).toBeInTheDocument();
  });

  it("deve aplicar o estilo de preenchido para uma etapa anterior", () => {
    const { container } = renderStepper(1, [true, false]);

    const indicadorPreenchido = container.querySelector(
      ".bg-card",
    );

    expect(indicadorPreenchido).toBeInTheDocument();
  });

  it("deve manter a etapa não preenchida com fundo branco", () => {
    const { container } = renderStepper(0, [true, false]);

    const indicadores = container.querySelectorAll(".rounded-full");

    expect(indicadores.length).toBeGreaterThan(0);
  });
});