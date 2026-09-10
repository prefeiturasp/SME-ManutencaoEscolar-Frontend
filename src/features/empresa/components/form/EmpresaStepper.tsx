"use client";
import { Stepper } from "@/components/shared/Stepper/Stepper";
import { EMPRESA_ETAPAS } from "@/features/empresa/constants/empresa.constants";

interface EmpresaStepperProps {
  readonly currentStep: number;
  readonly campos_preenchidos?: readonly boolean[];
  readonly modoEdicao?: boolean;
}

export function EmpresaStepper({
  currentStep,
  campos_preenchidos = [],
  modoEdicao = false,
}: EmpresaStepperProps) {
  return (
    <Stepper
      steps={EMPRESA_ETAPAS}
      currentStep={currentStep}
      camposPreenchidos={campos_preenchidos}
      modoEdicao={modoEdicao}
    />
  );
}
