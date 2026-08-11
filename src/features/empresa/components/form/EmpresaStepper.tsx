"use client";
import { CheckIcon } from "@/components/icons/check";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EMPRESA_ETAPAS } from "../../../../constants/constants";

interface EmpresaStepperProps {
  readonly currentStep: number;
}

export function EmpresaStepper({ currentStep }: EmpresaStepperProps) {
  return (
    <Card className="mb-4 p-0 pt-4">
      <CardContent className="p-6">
        <div className="relative flex items-start">
          <div className="absolute top-2.5 h-px w-full bg-muted-foreground/20" />
          {EMPRESA_ETAPAS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={step.key}
                className="relative flex flex-col items-center mx-8"
              >
                <span
                  className={cn(
                    "z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-background ring-8 ring-white",
                    isCompleted && "border-primary bg-primary",
                    isActive && "border-primary",
                    !isActive && !isCompleted && "border-muted-foreground/40",
                  )}
                >
                  {isCompleted && <CheckIcon className="h-3 w-3 text-white" />}
                </span>

                <span
                  className={cn(
                    "mt-5 text-sm whitespace-nowrap font-medium",
                    isActive
                      ? "font-medium text-foreground"
                      : "text-muted-foreground/40",
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
