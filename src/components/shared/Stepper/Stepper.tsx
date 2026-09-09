"use client";

import { CheckIcon } from "@/components/icons/check";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StepperStep {
  readonly key: string;
  readonly label: string;
}

interface StepperProps {
  readonly steps: readonly StepperStep[];
  readonly currentStep: number;
  readonly camposPreenchidos?: readonly boolean[];
}

export function Stepper({
  steps,
  currentStep,
  camposPreenchidos = [],
}: StepperProps) {
  return (
    <Card className="mb-4 p-0 pt-4">
      <CardContent className="p-6">
        <div className="relative flex items-start">
          <div className="absolute top-2.5 h-px w-full bg-muted-foreground/20" />

          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const preenchido = Boolean(camposPreenchidos[index]);

            return (
              <div
                key={step.key}
                className="relative mx-8 flex flex-col items-center"
              >
                <span
                  className={cn(
                    "relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-muted-foreground/40 ring-8 ring-white",
                    isActive && "border-primary",
                    preenchido && isActive && "bg-primary",
                    preenchido &&
                      !isActive &&
                      "bg-card before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-muted-foreground/20 before:content-['']",
                    !preenchido && "bg-white",
                  )}
                >
                  {preenchido && (
                    <CheckIcon
                      className={cn(
                        "h-3 w-3",
                        isActive
                          ? "text-white"
                          : "text-muted-foreground/40",
                      )}
                    />
                  )}
                </span>

                <span
                  className={cn(
                    "mt-5 whitespace-nowrap text-sm font-medium",
                    isActive
                      ? "text-foreground"
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