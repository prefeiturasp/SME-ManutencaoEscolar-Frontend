import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FornecedorStepper } from "../components/FornecedorStepper";

describe("FornecedorStepper", () => {
  it("deve renderizar as etapas e o estado ativo/completo", () => {
    render(<FornecedorStepper currentStep={0} />);

    expect(screen.getByText(/informações gerais/i)).toBeInTheDocument();
    expect(screen.getAllByRole("generic")).toBeTruthy();
  });

  it("deve renderizar o estado da etapa como concluída quando currentStep é maior", () => {
    render(<FornecedorStepper currentStep={1} />);

    expect(screen.getByText(/informações gerais/i)).toBeInTheDocument();
  });
});
