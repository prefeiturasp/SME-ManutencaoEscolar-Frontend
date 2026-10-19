"use client";

import { useId } from "react";

import { Card } from "@/components/ui/card";
import { FormError } from "@/components/form/FormError";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { TipoAtendimento } from "../../schemas/dadosSolicitacaoSchema";
export type { TipoAtendimento } from "../../schemas/dadosSolicitacaoSchema";

type DadosSolicitacaoProps = Readonly<{
  valor?: TipoAtendimento | "";
  onChange?: (valor: TipoAtendimento) => void;
  onBlur?: () => void;
  erro?: string;
  className?: string;
}>;

export function DadosSolicitacao({
  valor,
  onChange,
  onBlur,
  erro,
  className,
}: DadosSolicitacaoProps) {
  const id = useId();

  return (
    <Card className={className}>
      <section aria-labelledby={`${id}-titulo`} className="space-y-4 p-2 text-gray">
        <div className="space-y-1">
          <h2 id={`${id}-titulo`} className="text-lg font-semibold">
            Dados da solicitação
          </h2>
          <p id={`${id}-descricao`} className="text-sm">
            Selecione o tipo de atendimento da sua solicitação.
          </p>
        </div>

        <div className="w-full space-y-1 sm:max-w-96">
          <Label htmlFor={id} className="text-sm font-semibold">
            Tipo de atendimento
          </Label>
          <Select
            name="tipo_atendimento"
            required
            value={valor}
            onOpenChange={(aberto) => {
              if (!aberto) onBlur?.();
            }}
            onValueChange={(value) => {
              if (value === "comum" || value === "urgente") {
                onChange?.(value);
              }
            }}
          >
            <SelectTrigger
              id={id}
              className="w-full"
              onBlur={onBlur}
              aria-invalid={Boolean(erro)}
              aria-describedby={`${id}-descricao${erro ? ` ${id}-erro` : ""}`}
            >
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectItem value="comum">Comum</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
          {erro && (
            <div id={`${id}-erro`}>
              <FormError message={erro} />
            </div>
          )}
        </div>
      </section>
    </Card>
  );
}
