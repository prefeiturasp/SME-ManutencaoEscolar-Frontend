"use client";
import { Stepper } from "@/components/shared/Stepper/Stepper";


interface UnidadeEducacionalStepperProps {
  readonly currentStep: number;
  readonly campos_preenchidos?: readonly boolean[];
}

export const UNIDADE_EDUCACIONAL_ETAPAS = [
  { key: "informacoes-gerais", label: "Informações gerais" },
  { key: "contatos", label: "Contatos" },
] as const;

export function UnidadeEducacionalStepper({
  currentStep,
  campos_preenchidos = [],
}: UnidadeEducacionalStepperProps) {

  return (
    <Stepper
      steps={UNIDADE_EDUCACIONAL_ETAPAS}
      currentStep={currentStep}
      camposPreenchidos={campos_preenchidos}
    />
  );
}
