"use client";
import { CheckIcon } from "@/components/icons/check";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EMPRESA_ETAPAS } from "@/features/empresa/constants/empresa.constants";

interface EmpresaStepperProps {
  readonly currentStep: number;
  readonly campos_preenchidos?: readonly boolean[];
}

export function EmpresaStepper({
  currentStep,
  campos_preenchidos = [],
}: EmpresaStepperProps) {
  return (
    <Card className="mb-4 p-0 pt-4">
      <CardContent className="p-6">
        <div className="relative flex items-start">
          <div className="absolute top-2.5 h-px w-full bg-muted-foreground/20" />
          {EMPRESA_ETAPAS.map((step, index) => {
            const isActive = index === currentStep;
            const preenchido = Boolean(campos_preenchidos[index]);

            return (
              <div
                key={step.key}
                className="relative flex flex-col items-center mx-8"
              >
                <span
                  className={cn(
                    "relative z-10 flex h-5 w-5 items-center justify-center border-muted-foreground/40 rounded-full border-2 ring-8 ring-white",
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
                        isActive ? "text-white" : "text-muted-foreground/40",
                      )}
                    />
                  )}
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
