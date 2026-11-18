"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useId } from "react";
import { FormError } from "@/components/form/FormError";

export function DecisaoDre({
  situacao,
  dataAlteracao,
  onChange,
  onBlur,
  erro,
}: Readonly<{
  situacao: string;
  dataAlteracao: string;
  onChange: (situacao: string) => void;
  onBlur?: () => void;
  erro?: string;
}>) {
  const id = useId();
  return (
    <Card>
      <section aria-labelledby={`${id}-titulo`} className="space-y-4 p-2 text-gray">
        <div className="space-y-1">
          <h2 id={`${id}-titulo`} className="text-lg font-semibold">
            Decisão da DRE
          </h2>
          <p className="text-sm">
            Selecione o resultado da análise da solicitação. A data da decisão será registrada
            automaticamente.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor={`${id}-situacao`} className="text-sm font-semibold">
              Situação
            </Label>
            <Select
              value={situacao}
              onValueChange={onChange}
              onOpenChange={(aberto) => {
                if (!aberto) onBlur?.();
              }}
            >
              <SelectTrigger
                id={`${id}-situacao`}
                className="w-full"
                onBlur={onBlur}
                aria-invalid={Boolean(erro)}
                aria-describedby={erro ? `${id}-erro` : undefined}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectItem value="aprovada">Aprovada (DRE)</SelectItem>
                <SelectItem value="reprovada">Reprovada (DRE)</SelectItem>
                <SelectItem value="necessidade_revisao">Necessidade de revisão (UE)</SelectItem>
              </SelectContent>
            </Select>
            {erro && (
              <div id={`${id}-erro`}>
                <FormError message={erro} />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${id}-data`} className="text-sm font-semibold">
              Data de alteração
            </Label>
            <Input
              id={`${id}-data`}
              value={dataAlteracao}
              placeholder="00/00/0000"
              readOnly
              className="bg-[#f5f5f5]"
            />
          </div>
        </div>
      </section>
    </Card>
  );
}
