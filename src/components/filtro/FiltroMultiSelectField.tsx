"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";
import { useRef, useState } from "react";
import type { Opcao } from "@/components/types/opcao.types";

export type FiltroMultiSelectFieldProps = Readonly<{
  id: string;
  label: string;
  value: readonly string[];
  options: readonly Opcao[];
  onChange: (valores: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}>;

export function FiltroMultiSelectField({
  id,
  label,
  value: valores,
  options: opcoes,
  onChange,
  placeholder = "Selecione",
  disabled = false,
  className,
}: FiltroMultiSelectFieldProps) {
  const [aberto, setAberto] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selecionadas = opcoes.filter((opcao) => valores.includes(opcao.value));
  const todasSelecionadas = opcoes.length > 0 && selecionadas.length === opcoes.length;
  const parcialmenteSelecionadas = selecionadas.length > 0 && !todasSelecionadas;

  function alternar(valor: string) {
    onChange(
      valores.includes(valor) ? valores.filter((atual) => atual !== valor) : [...valores, valor],
    );
  }

  function remover(valor: string) {
    onChange(valores.filter((atual) => atual !== valor));
    triggerRef.current?.focus();
  }

  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Popover open={aberto && !disabled} onOpenChange={setAberto}>
        <div
          className={cn(
            "relative flex min-h-10 w-full items-center gap-2 rounded-md border border-input bg-white px-2 py-1 text-sm",
            "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
            aberto && "border-ring ring-[3px] ring-ring/50",
            disabled && "opacity-50",
          )}
        >
          <PopoverTrigger asChild>
            <Button
              ref={triggerRef}
              id={id}
              type="button"
              disabled={disabled}
              variant="ghost"
              aria-label={label}
              aria-describedby={selecionadas.length ? `${id}-selecionadas` : undefined}
              className="absolute inset-0 z-0 h-full w-full max-w-none rounded-md hover:bg-transparent aria-expanded:bg-transparent focus-visible:ring-0"
            >
              <span className="sr-only">
                {selecionadas.length ? "Alterar seleção" : placeholder}
              </span>
            </Button>
          </PopoverTrigger>
          <div
            id={`${id}-selecionadas`}
            className="pointer-events-none relative z-10 flex min-w-0 flex-1 flex-wrap gap-1"
          >
            {selecionadas.length ? (
              selecionadas.map((opcao) => (
                <Badge
                  key={opcao.value}
                  variant="secondary"
                  className="h-7 max-w-full gap-1 rounded-md bg-[#EEEEEE] px-2 font-normal text-gray"
                >
                  <span className="truncate">{opcao.label}</span>
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={`Remover ${opcao.label}`}
                    className="pointer-events-auto shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-primary"
                    onClick={() => remover(opcao.value)}
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="px-1 text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              "pointer-events-none relative z-10 size-4 shrink-0 transition-transform",
              aberto && "rotate-180",
            )}
            aria-hidden="true"
          />
        </div>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={4}
          className="w-(--radix-popover-trigger-width) p-2 text-gray"
        >
          <fieldset className="max-h-64 space-y-1 overflow-y-auto">
            <legend className="sr-only">{label}</legend>
            <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-2 text-sm hover:bg-accent">
              <input
                type="checkbox"
                checked={todasSelecionadas}
                disabled={disabled || opcoes.length === 0}
                ref={(elemento) => {
                  if (elemento) elemento.indeterminate = parcialmenteSelecionadas;
                }}
                onChange={() =>
                  onChange(todasSelecionadas ? [] : opcoes.map((opcao) => opcao.value))
                }
                className="size-4 shrink-0 accent-primary"
              />
              <span>Selecionar todas</span>
            </label>
            {opcoes.map((opcao) => (
              <label
                key={opcao.value}
                className="flex cursor-pointer items-center gap-2 rounded px-1 py-2 text-sm hover:bg-accent"
              >
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={valores.includes(opcao.value)}
                  onChange={() => alternar(opcao.value)}
                  className="size-4 shrink-0 accent-primary"
                />
                <span>{opcao.label}</span>
              </label>
            ))}
          </fieldset>
        </PopoverContent>
      </Popover>
    </div>
  );
}
