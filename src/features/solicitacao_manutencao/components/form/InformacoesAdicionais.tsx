"use client";

import type { InformacoesAdicionaisProps } from "@/features/solicitacao_manutencao/types/solicitacaoManutencao.types";
import { useId } from "react";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function InformacoesAdicionais({
  valor = "",
  onChange,
  className,
}: InformacoesAdicionaisProps) {
  const id = useId();

  return (
    <Card className={className}>
      <div className="space-y-1 p-2 text-gray">
        <Label htmlFor={id} className="text-sm font-semibold">
          Informações adicionais (opcional)
        </Label>
        <textarea
          id={id}
          name="informacoes_adicionais"
          value={valor}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder="Digite aqui..."
          rows={4}
          className="resize-none block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
    </Card>
  );
}
