"use client";

import { useOpcoesSolicitacaoManutencao } from "@/features/solicitacao_manutencao/hooks/useOpcoesSolicitacaoManutencao";
import type {
  DadosSolicitacaoManutencaoProps,
  TipoAtendimento,
} from "@/features/solicitacao_manutencao/types/solicitacaoManutencao.types";
import { useId } from "react";

import { FormError } from "@/components/form/FormError";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DadosSolicitacaoManutencao({
  valor,
  onChange,
  onBlur,
  erro,
  className,
}: DadosSolicitacaoManutencaoProps) {
  const id = useId();
  const {
    data: opcoes = [],
    isPending,
    isError,
    refetch,
  } = useOpcoesSolicitacaoManutencao("tipos_atendimento");

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
            disabled={isPending || isError || opcoes.length === 0}
            value={valor}
            onOpenChange={(aberto) => {
              if (!aberto) onBlur?.();
            }}
            onValueChange={(value) => onChange?.(value as TipoAtendimento)}
          >
            <SelectTrigger
              id={id}
              className="w-full"
              onBlur={onBlur}
              aria-invalid={Boolean(erro)}
              aria-describedby={erro ? `${id}-descricao ${id}-erro` : `${id}-descricao`}
            >
              <SelectValue placeholder={isPending ? "Carregando..." : "Selecione"} />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              {opcoes.map((opcao) => (
                <SelectItem key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isError && (
            <div role="alert">
              <FormError message="Não foi possível carregar os tipos de atendimento." />
              <button type="button" onClick={() => void refetch()}>
                Tentar novamente
              </button>
            </div>
          )}
          {!isPending && !isError && opcoes.length === 0 && (
            <FormError message="Nenhum tipo de atendimento disponível." />
          )}
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
